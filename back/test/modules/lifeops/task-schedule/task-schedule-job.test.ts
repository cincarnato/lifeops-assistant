import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest"
import TestSetup from "../../../setup/TestSetup"
import TaskScheduleServiceFactory from "../../../../src/modules/lifeops/factory/services/TaskScheduleServiceFactory"
import {TaskScheduleJob} from "../../../../src/modules/lifeops/jobs/TaskScheduleJob"
import {TaskModel} from "../../../../src/modules/lifeops/models/TaskModel"
import {TaskScheduleModel} from "../../../../src/modules/lifeops/models/TaskScheduleModel"
import type {ITaskScheduleBase} from "../../../../src/modules/lifeops/interfaces/ITaskSchedule"

describe("TaskScheduleJob", () => {
    const now = new Date("2026-11-05T12:00:00.000Z")
    let testSetup = new TestSetup()

    beforeAll(async () => {
        await testSetup.setup()
        await TaskModel.syncIndexes()
        await TaskScheduleModel.syncIndexes()
    })

    beforeEach(async () => {
        await TaskModel.deleteMany({})
        await TaskScheduleModel.deleteMany({})
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
    })

    it("creates a task for an active due schedule and updates runtime", async () => {
        const schedule = await createSchedule({
            dueDateRule: {type: "daysAfter", daysAfter: 5},
            runtime: {nextRunAt: now}
        })

        const result = await runJob()
        const task = await TaskModel.findOne({taskSchedule: schedule._id}).lean().exec()
        const updatedSchedule = await TaskScheduleModel.findById(schedule._id).lean().exec()

        expect(result.processed).toBe(1)
        expect(task?.title).toBe("Pagar tarjeta Visa")
        expect(task?.taskSchedule?.toString()).toBe(schedule._id.toString())
        expect(task?.scheduledFor?.toISOString()).toBe(now.toISOString())
        expect(task?.dueDate?.toISOString()).toBe("2026-11-10T12:00:00.000Z")
        expect(updatedSchedule?.runtime?.lastStatus).toBe("success")
        expect(updatedSchedule?.runtime?.lastTaskId?.toString()).toBe(task?._id.toString())
        expect(updatedSchedule?.runtime?.nextRunAt?.toISOString()).toBe("2026-12-05T12:00:00.000Z")
    })

    it("does not process future or inactive schedules", async () => {
        await createSchedule({
            schedule: {
                type: "once",
                runAt: new Date("2026-11-06T12:00:00.000Z"),
                timezone: "America/Argentina/Buenos_Aires"
            }
        })
        await createSchedule({name: "inactive", active: false, runtime: {nextRunAt: now}})

        const result = await runJob()

        expect(result.processed).toBe(0)
        expect(await TaskModel.countDocuments()).toBe(0)
    })

    it("recalculates nextRunAt when a monthly execution day is edited", async () => {
        const schedule = await createSchedule({
            startAt: new Date("2099-01-01T00:00:00.000Z")
        })

        const updated = await TaskScheduleServiceFactory.instance.updatePartial(schedule._id.toString(), {
            schedule: {
                ...schedule.schedule,
                daysOfMonth: [12]
            }
        })

        expect(updated.runtime?.nextRunAt?.toISOString()).toBe("2099-01-12T12:00:00.000Z")
    })

    it("initializes an active schedule whose nextRunAt is missing and cleans legacy epoch dates", async () => {
        const schedule = await createSchedule()
        await TaskScheduleModel.updateOne({_id: schedule._id}, {
            $set: {
                "schedule.runAt": new Date(0),
                "runtime.lastRunAt": new Date(0),
                startAt: new Date(0),
                endAt: new Date(0)
            },
            $unset: {"runtime.nextRunAt": 1}
        }).exec()

        const result = await runJob()
        const updatedSchedule = await TaskScheduleModel.findById(schedule._id).lean().exec()

        expect(result.initialized).toBe(1)
        expect(result.processed).toBe(0)
        expect(updatedSchedule?.runtime?.nextRunAt?.toISOString()).toBe("2026-12-05T12:00:00.000Z")
        expect(updatedSchedule?.schedule.runAt).toBeNull()
        expect(updatedSchedule?.runtime?.lastRunAt).toBeNull()
        expect(updatedSchedule?.startAt).toBeNull()
        expect(updatedSchedule?.endAt).toBeNull()
    })

    it("does not duplicate a task when run twice for the same occurrence", async () => {
        const schedule = await createSchedule({runtime: {nextRunAt: now}})

        await runJob()
        await TaskScheduleModel.updateOne({_id: schedule._id}, {$set: {"runtime.nextRunAt": now}}).exec()
        const second = await runJob()

        expect(second.duplicates).toBe(1)
        expect(await TaskModel.countDocuments({taskSchedule: schedule._id, scheduledFor: now})).toBe(1)
    })

    it("recovers when task exists but runtime was not advanced", async () => {
        const schedule = await createSchedule({runtime: {nextRunAt: now}})
        await TaskModel.create({
            title: "Pagar tarjeta Visa",
            user: testSetup.rootUser._id,
            taskSchedule: schedule._id,
            scheduledFor: now
        })

        const result = await runJob()
        const updatedSchedule = await TaskScheduleModel.findById(schedule._id).lean().exec()

        expect(result.duplicates).toBe(1)
        expect(await TaskModel.countDocuments({taskSchedule: schedule._id, scheduledFor: now})).toBe(1)
        expect(updatedSchedule?.runtime?.lastStatus).toBe("success")
        expect(updatedSchedule?.runtime?.nextRunAt?.toISOString()).toBe("2026-12-05T12:00:00.000Z")
    })

    it("handles two workers attempting the same occurrence concurrently", async () => {
        const schedule = await createSchedule({runtime: {nextRunAt: now}})
        const service = TaskScheduleServiceFactory.instance

        const [first, second] = await Promise.all([
            service.executeDueSchedule(schedule, now),
            service.executeDueSchedule(schedule, now)
        ])

        expect([first.duplicate, second.duplicate].filter(Boolean).length).toBe(1)
        expect(await TaskModel.countDocuments({taskSchedule: schedule._id, scheduledFor: now})).toBe(1)
    })

    async function runJob() {
        return new TaskScheduleJob(TaskScheduleServiceFactory.instance).run({now, limit: 25})
    }

    async function createSchedule(overrides: Partial<ITaskScheduleBase> = {}) {
        const payload: ITaskScheduleBase = {
            name: "Pagar tarjeta Visa",
            active: true,
            task: {
                title: "Pagar tarjeta Visa",
                description: "Revisar resumen y pagar tarjeta",
                type: "FINANCE",
                lifeArea: "FINANCES",
                priority: "HIGH",
                tags: ["tarjeta", "visa"]
            },
            schedule: {
                type: "monthly",
                daysOfMonth: [5],
                time: "09:00",
                timezone: "America/Argentina/Buenos_Aires"
            },
            dueDateRule: {type: "none"},
            user: testSetup.rootUser._id,
            ...overrides
        }

        return TaskScheduleServiceFactory.instance.create(payload)
    }
})
