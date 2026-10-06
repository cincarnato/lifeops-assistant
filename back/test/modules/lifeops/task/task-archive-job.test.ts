import {describe, it, beforeAll, afterAll, beforeEach, expect} from "vitest"
import TestSetup from "../../../setup/TestSetup"
import TaskServiceFactory from "../../../../src/modules/lifeops/factory/services/TaskServiceFactory"
import {TaskArchiveJob} from "../../../../src/modules/lifeops/jobs/TaskArchiveJob"
import {TaskModel} from "../../../../src/modules/lifeops/models/TaskModel"
import {TaskArchivedModel} from "../../../../src/modules/lifeops/models/TaskArchivedModel"
import type {ITask, ITaskBase} from "../../../../src/modules/lifeops/interfaces/ITask"

describe("Task archive job", function () {
    const now = new Date("2026-10-05T12:00:00.000Z")
    const olderThanGrace = new Date(now.getTime() - 73 * 60 * 60 * 1000)
    const insideGrace = new Date(now.getTime() - 71 * 60 * 60 * 1000)

    let testSetup = new TestSetup()

    beforeAll(async () => {
        await testSetup.setup()
    })

    beforeEach(async () => {
        await TaskModel.deleteMany({})
        await TaskArchivedModel.deleteMany({})
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
    })

    it("does not migrate active tasks", async () => {
        await createTask("active")

        const result = await runJob()

        expect(result.archived).toBe(0)
        expect(await TaskModel.countDocuments()).toBe(1)
        expect(await TaskArchivedModel.countDocuments()).toBe(0)
    })

    it("does not migrate tasks archived less than 72 hours ago", async () => {
        await createTask("recently archived", insideGrace)

        const result = await runJob()

        expect(result.archived).toBe(0)
        expect(await TaskModel.countDocuments()).toBe(1)
        expect(await TaskArchivedModel.countDocuments()).toBe(0)
    })

    it("migrates tasks archived more than 72 hours ago preserving the same id", async () => {
        const task = await createTask("old archived", olderThanGrace)

        const result = await runJob()

        expect(result.archived).toBe(1)
        expect(await TaskModel.findById(task._id)).toBeNull()

        const archivedTask = await TaskArchivedModel.findById(task._id).lean().exec()
        expect(archivedTask?._id.toString()).toBe(task._id.toString())
        expect(archivedTask?.title).toBe("old archived")
        expect(archivedTask?.migratedAt).toBeInstanceOf(Date)
        expect(archivedTask?.schemaVersion).toBe(1)
    })

    it("findById finds active and historical tasks", async () => {
        const activeTask = await createTask("active")
        const historicalTask = await createTask("historical", olderThanGrace)

        await runJob()

        const activeFound = await TaskServiceFactory.instance.findById(activeTask._id)
        const historicalFound = await TaskServiceFactory.instance.findById(historicalTask._id)

        expect(activeFound?.title).toBe("active")
        expect(historicalFound?.title).toBe("historical")
    })

    it("can run twice without duplicates", async () => {
        const task = await createTask("idempotent", olderThanGrace)

        await runJob()
        await runJob()

        expect(await TaskModel.findById(task._id)).toBeNull()
        expect(await TaskArchivedModel.countDocuments({_id: task._id})).toBe(1)
    })

    it("completes on a second run after failing after the archived insert", async () => {
        const task = await createTask("retry after insert", olderThanGrace)
        const failingService = {
            findPendingArchiveBatch: (...args: any[]) =>
                TaskServiceFactory.instance.findPendingArchiveBatch(...args),
            archiveTask: async (taskToArchive: ITask) => {
                await TaskArchivedModel.updateOne(
                    {_id: taskToArchive._id},
                    {
                        $setOnInsert: {
                            ...taskToArchive,
                            migratedAt: new Date(),
                            schemaVersion: 1
                        }
                    },
                    {upsert: true, timestamps: false}
                ).exec()
                throw new Error("simulated.failure.afterInsert")
            }
        }

        const firstResult = await new TaskArchiveJob(failingService as any).run({
            now,
            archiveAfterHours: 72,
            batchSize: 100
        })
        expect(firstResult.failed).toBe(1)
        expect(await TaskModel.findById(task._id)).toBeTruthy()
        expect(await TaskArchivedModel.countDocuments({_id: task._id})).toBe(1)

        const secondResult = await runJob()

        expect(secondResult.archived).toBe(1)
        expect(await TaskModel.findById(task._id)).toBeNull()
        expect(await TaskArchivedModel.countDocuments({_id: task._id})).toBe(1)
    })

    it("does not migrate a task unarchived before the grace window expires", async () => {
        const task = await createTask("unarchived", insideGrace)
        await TaskServiceFactory.instance.updatePartial(task._id, {archivedAt: null})

        await runJob()

        expect(await TaskModel.findById(task._id)).toBeTruthy()
        expect(await TaskArchivedModel.findById(task._id)).toBeNull()
    })

    it("processes pending tasks by batches", async () => {
        for (let index = 0; index < 5; index += 1) {
            await createTask(`batch ${index}`, olderThanGrace)
        }

        const result = await runJob(2)

        expect(result.found).toBe(5)
        expect(result.archived).toBe(5)
        expect(await TaskModel.countDocuments()).toBe(0)
        expect(await TaskArchivedModel.countDocuments()).toBe(5)
    })

    it("paginateArchived reads only TaskArchived", async () => {
        await createTask("active")
        await createTask("historical", olderThanGrace)
        await runJob()

        const activeResult = await TaskServiceFactory.instance.paginate({page: 1, limit: 10})
        const archivedResult = await TaskServiceFactory.instance.paginateArchived({page: 1, limit: 10})

        expect(activeResult.items.map(task => task.title)).toEqual(["active"])
        expect(archivedResult.items.map(task => task.title)).toEqual(["historical"])
    })

    async function runJob(batchSize = 100) {
        return new TaskArchiveJob(TaskServiceFactory.instance).run({
            now,
            archiveAfterHours: 72,
            batchSize
        })
    }

    async function createTask(title: string, archivedAt?: Date): Promise<ITask> {
        const taskData: ITaskBase = {
            title,
            user: testSetup.rootUser._id
        }
        const task = await TaskServiceFactory.instance.create(taskData)

        if (archivedAt !== undefined) {
            await TaskModel.updateOne({_id: task._id}, {$set: {archivedAt}}).exec()
            return TaskModel.findById(task._id).lean().exec() as Promise<ITask>
        }

        return task
    }
})
