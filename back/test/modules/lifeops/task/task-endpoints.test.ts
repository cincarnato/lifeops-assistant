import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest"
import TestSetup from "../../../setup/TestSetup"
import TaskRoutes from "../../../../src/modules/lifeops/routes/TaskRoutes"
import TaskPermissions from "../../../../src/modules/lifeops/permissions/TaskPermissions"
import TaskSchedulePermissions from "../../../../src/modules/lifeops/permissions/TaskSchedulePermissions"
import TaskServiceFactory from "../../../../src/modules/lifeops/factory/services/TaskServiceFactory"
import TaskScheduleServiceFactory from "../../../../src/modules/lifeops/factory/services/TaskScheduleServiceFactory"
import {TaskModel} from "../../../../src/modules/lifeops/models/TaskModel"
import {TaskScheduleModel} from "../../../../src/modules/lifeops/models/TaskScheduleModel"
import {TaskArchivedModel} from "../../../../src/modules/lifeops/models/TaskArchivedModel"
import MigrateTaskImportance from "../../../../src/setup/scripts/MigrateTaskImportance"
import type {ITaskNote} from "../../../../src/modules/lifeops/interfaces/ITask"

describe("Task endpoints", () => {
    const now = new Date("2026-11-05T12:00:00.000Z")
    const testSetup = new TestSetup({
        routes: [TaskRoutes],
        permissions: [TaskPermissions, TaskSchedulePermissions]
    })

    beforeAll(async () => {
        await testSetup.setup()
        await TaskModel.syncIndexes()
        await TaskScheduleModel.syncIndexes()
    })

    beforeEach(async () => {
        await TaskModel.deleteMany({})
        await TaskArchivedModel.deleteMany({})
        await TaskScheduleModel.deleteMany({})
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
    })

    it("migrates active and archived importance idempotently and sorts numerically", async () => {
        for (const collection of [TaskModel.collection, TaskArchivedModel.collection]) {
            await collection.insertMany(['LOW', 'HIGH', 'MEDIUM', 2, null, undefined].map((importance, index) => ({
                title: String(index),
                ...(importance === undefined ? {} : {importance})
            })))
        }

        await MigrateTaskImportance()
        await MigrateTaskImportance()

        for (const collection of [TaskModel.collection, TaskArchivedModel.collection]) {
            const tasks = await collection.find({}).sort({title: 1}).toArray()
            expect(tasks.map(task => task.importance)).toEqual([1, 3, 2, 2, null, undefined])
            expect(tasks[5]).not.toHaveProperty('importance')
            const sorted = await collection.find({importance: {$type: 'number'}}).sort({importance: -1}).toArray()
            expect(sorted.map(task => task.importance)).toEqual([3, 2, 2, 1])
        }
    })

    it.each([3, 2, 1] as const)("creates and reads tasks with importance %s", async importance => {
        const {accessToken} = await testSetup.rootUserLogin()
        const response = await testSetup.fastifyInstance.inject({
            method: "POST",
            url: "/api/tasks",
            headers: {Authorization: `Bearer ${accessToken}`},
            payload: {title: "Task with importance", importance}
        })

        expect(response.statusCode).toBe(200)
        const task = response.json()
        expect(task.importance).toBe(importance)
        const persisted = await TaskModel.findById(task._id).lean().exec()
        expect(persisted?.importance).toBe(importance)

        const readResponse = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: `/api/tasks/${task._id}`,
            headers: {Authorization: `Bearer ${accessToken}`}
        })
        expect(readResponse.statusCode).toBe(200)
        expect(readResponse.json().importance).toBe(importance)
    })

    it.each(["PUT", "PATCH"] as const)("updates and clears importance on %s", async method => {
        const {accessToken} = await testSetup.rootUserLogin()
        const task = await TaskServiceFactory.instance.create({
            title: "Task with importance",
            user: testSetup.rootUser._id,
            importance: 3
        })

        for (const importance of [1, null]) {
            const response = await testSetup.fastifyInstance.inject({
                method,
                url: `/api/tasks/${task._id}`,
                headers: {Authorization: `Bearer ${accessToken}`},
                payload: {importance}
            })

            expect(response.statusCode).toBe(200)
            expect(response.json().importance).toBe(importance)
            const persisted = await TaskModel.findById(task._id).lean().exec()
            expect(persisted?.importance).toBe(importance)
        }
    })

    it.each(["POST", "PUT", "PATCH"] as const)("rejects invalid importance on %s", async method => {
        const {accessToken} = await testSetup.rootUserLogin()
        const task = await TaskServiceFactory.instance.create({
            title: "Task with importance",
            user: testSetup.rootUser._id,
            importance: 2
        })
        const response = await testSetup.fastifyInstance.inject({
            method,
            url: method === "POST" ? "/api/tasks" : `/api/tasks/${task._id}`,
            headers: {Authorization: `Bearer ${accessToken}`},
            payload: {title: "Invalid importance", importance: 'D'}
        })

        expect(response.statusCode).toBe(422)
        const persisted = await TaskModel.findById(task._id).lean().exec()
        expect(persisted?.importance).toBe(2)
    })

    it("keeps importance unchanged when a PATCH omits it", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        const task = await TaskServiceFactory.instance.create({
            title: "Task with importance",
            user: testSetup.rootUser._id,
            importance: 1
        })
        const response = await testSetup.fastifyInstance.inject({
            method: "PATCH",
            url: `/api/tasks/${task._id}`,
            headers: {Authorization: `Bearer ${accessToken}`},
            payload: {urgent: true}
        })

        expect(response.statusCode).toBe(200)
        expect(response.json().importance).toBe(1)
        const persisted = await TaskModel.findById(task._id).lean().exec()
        expect(persisted?.importance).toBe(1)
    })

    it("assigns note dates in the backend when creating a task", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        const startedAt = Date.now()
        const response = await testSetup.fastifyInstance.inject({
            method: "POST",
            url: "/api/tasks",
            headers: {Authorization: `Bearer ${accessToken}`},
            payload: {
                title: "Task with notes",
                notes: [
                    {note: "First note"},
                    {note: "Second note", date: "2000-01-01T00:00:00.000Z"}
                ]
            }
        })

        expect(response.statusCode).toBe(200)
        const task = response.json()
        const persisted = await TaskModel.findById(task._id).lean().exec()
        expect(persisted?.notes).toHaveLength(2)
        for (const note of task.notes) {
            expect(new Date(note.date).getTime()).toBeGreaterThanOrEqual(startedAt)
            expect(new Date(note.date).getTime()).toBeLessThanOrEqual(Date.now())
        }
    })

    it.each(["PUT", "PATCH"] as const)("preserves existing note dates and dates new notes on %s", async method => {
        const {accessToken} = await testSetup.rootUserLogin()
        const task = await TaskServiceFactory.instance.create({
            title: "Task with an existing note",
            user: testSetup.rootUser._id,
            notes: [{note: "Existing note"}]
        })
        await TaskModel.updateOne({_id: task._id}, {$set: {"notes.0.date": now}})
        const existingTask = await TaskServiceFactory.instance.findById(task._id)
        const startedAt = Date.now()
        const response = await testSetup.fastifyInstance.inject({
            method,
            url: `/api/tasks/${task._id}`,
            headers: {Authorization: `Bearer ${accessToken}`},
            payload: {
                notes: [
                    ...existingTask.notes as ITaskNote[],
                    {note: "New note"}
                ]
            }
        })

        expect(response.statusCode).toBe(200)
        const notes = response.json().notes
        expect(notes).toHaveLength(2)
        expect(notes[0].date).toBe(now.toISOString())
        expect(new Date(notes[1].date).getTime()).toBeGreaterThanOrEqual(startedAt)
        const persisted = await TaskModel.findById(task._id).lean().exec()
        expect((persisted?.notes as ITaskNote[])[0].date.toISOString()).toBe(now.toISOString())
        expect((persisted?.notes as ITaskNote[])[1].date.toISOString()).toBe(notes[1].date)
    })

    it("keeps notes unchanged when a PATCH omits them", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        const task = await TaskServiceFactory.instance.create({
            title: "Task with notes",
            user: testSetup.rootUser._id,
            notes: [{note: "Keep this note"}]
        })
        const previous = await TaskModel.findById(task._id).lean().exec()
        const response = await testSetup.fastifyInstance.inject({
            method: "PATCH",
            url: `/api/tasks/${task._id}`,
            headers: {Authorization: `Bearer ${accessToken}`},
            payload: {urgent: true}
        })

        expect(response.statusCode).toBe(200)
        const persisted = await TaskModel.findById(task._id).lean().exec()
        expect(persisted?.notes).toEqual(previous?.notes)
    })

    it("does not invent dates when reading legacy notes", async () => {
        const task = await TaskModel.create({
            title: "Task with legacy notes",
            user: testSetup.rootUser._id,
            notes: [{note: "Undated note"}]
        })

        const result = await TaskServiceFactory.instance.findById(task._id.toString())

        expect(result?.notes).toEqual([{note: "Undated note", date: undefined}])
    })

    it("ignores schedule metadata when editing a generated task with a populated schedule", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        const schedule = await TaskScheduleServiceFactory.instance.create({
            name: "Pagar expensas directorio",
            active: true,
            task: {
                title: "Pagar expensas directorio",
                description: "Pago mensual de expensas del directorio"
            },
            schedule: {
                type: "monthly",
                daysOfMonth: [5],
                time: "09:00",
                timezone: "America/Argentina/Buenos_Aires"
            },
            dueDateRule: {type: "none"},
            user: testSetup.rootUser._id
        })
        const task = await TaskServiceFactory.instance.create({
            title: "Pagar expensas directorio",
            description: "Pago mensual de expensas del directorio",
            user: testSetup.rootUser._id,
            taskSchedule: schedule._id,
            scheduledFor: now,
            urgent: false
        })

        const response = await testSetup.fastifyInstance.inject({
            method: "PUT",
            url: `/api/tasks/${task._id}`,
            headers: {Authorization: `Bearer ${accessToken}`},
            payload: {
                ...task,
                urgent: true
            }
        })

        const persisted = await TaskModel.findById(task._id).lean().exec()

        expect(response.statusCode).toBe(200)
        expect(response.json().urgent).toBe(true)
        expect(persisted?.taskSchedule?.toString()).toBe(schedule._id.toString())
        expect(persisted?.scheduledFor?.toISOString()).toBe(now.toISOString())
    })
})
