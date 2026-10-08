import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest"
import TestSetup from "../../../setup/TestSetup"
import TaskRoutes from "../../../../src/modules/lifeops/routes/TaskRoutes"
import TaskPermissions from "../../../../src/modules/lifeops/permissions/TaskPermissions"
import TaskSchedulePermissions from "../../../../src/modules/lifeops/permissions/TaskSchedulePermissions"
import TaskServiceFactory from "../../../../src/modules/lifeops/factory/services/TaskServiceFactory"
import TaskScheduleServiceFactory from "../../../../src/modules/lifeops/factory/services/TaskScheduleServiceFactory"
import {TaskModel} from "../../../../src/modules/lifeops/models/TaskModel"
import {TaskScheduleModel} from "../../../../src/modules/lifeops/models/TaskScheduleModel"

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
        await TaskScheduleModel.deleteMany({})
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
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
