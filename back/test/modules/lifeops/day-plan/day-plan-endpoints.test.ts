import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi} from "vitest"
import {mongoose} from "@drax/common-back"
import TestSetup from "../../../setup/TestSetup"
import DayPlanRoutes from "../../../../src/modules/lifeops/routes/DayPlanRoutes"
import DayPlanPermissions from "../../../../src/modules/lifeops/permissions/DayPlanPermissions"
import {DayPlanModel} from "../../../../src/modules/lifeops/models/DayPlanModel"
import {TaskModel} from '../../../../src/modules/lifeops/models/TaskModel'
import TaskPermissions from '../../../../src/modules/lifeops/permissions/TaskPermissions'
import GoogleCalendarServiceFactory from '../../../../src/modules/google/factory/GoogleCalendarServiceFactory'

describe("DayPlan endpoints", () => {
    const testSetup = new TestSetup({
        routes: [DayPlanRoutes],
        permissions: [DayPlanPermissions, TaskPermissions]
    })

    beforeAll(async () => {
        await testSetup.setup()
        await DayPlanModel.syncIndexes()
    })

    beforeEach(async () => {
        await DayPlanModel.deleteMany({})
        await TaskModel.deleteMany({})
    })

    afterEach(() => vi.restoreAllMocks())

    afterAll(async () => {
        await testSetup.dropAndClose()
    })

    it('returns only the logged-in user plan and does not regenerate existing plans', async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        const headers = {Authorization: `Bearer ${accessToken}`}
        await DayPlanModel.create({date: new Date('2030-01-02'), user: testSetup.basicUser._id, status: 'VISTO'})
        const absent = await testSetup.fastifyInstance.inject({method: 'GET', url: '/api/day-plans/planning?date=2030-01-02', headers})
        expect(absent.statusCode).toBe(200)
        expect(absent.json()).toBeNull()
        const plan = await DayPlanModel.create({date: new Date('2030-01-02'), user: testSetup.rootUser._id, status: 'VISTO'})
        const generated = await testSetup.fastifyInstance.inject({method: 'POST', url: '/api/day-plans/generate', headers, payload: {date: '2030-01-02'}})
        expect(generated.statusCode).toBe(200)
        expect(generated.json()).toMatchObject({_id: String(plan._id), status: 'VISTO'})
        expect(await DayPlanModel.countDocuments()).toBe(2)
    })

    it('persists priorities, confirms, and keeps status untouched in a tasks-only PATCH', async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        const headers = {Authorization: `Bearer ${accessToken}`}
        const projectId = new mongoose.Types.ObjectId()
        await mongoose.model('Project').collection.insertOne({_id: projectId, name: 'Project title', user: testSetup.rootUser._id})
        const tasks = await TaskModel.create(['One', 'Two', 'Three'].map(title => ({title, user: testSetup.rootUser._id, project: projectId})))
        const plan = await DayPlanModel.create({date: new Date('2030-01-02'), user: testSetup.rootUser._id, status: 'VISTO'})
        const url = `/api/day-plans/${plan._id}`
        const invalid = await testSetup.fastifyInstance.inject({method: 'PATCH', url, headers, payload: {status: 'CONFIRMADO'}})
        expect(invalid.statusCode).toBe(422)
        const ranked = tasks.map((task, index) => ({task: String(task._id), priority: `A${index + 1}`}))
        const patched = await testSetup.fastifyInstance.inject({method: 'PATCH', url, headers, payload: {tasks: ranked}})
        expect(patched.statusCode).toBe(200)
        expect(patched.json().status).toBe('VISTO')
        expect(patched.json().tasks[0]).toMatchObject({priority: 'A1', task: {title: 'One', project: {name: 'Project title'}}})
        const confirmed = await testSetup.fastifyInstance.inject({method: 'PATCH', url, headers, payload: {status: 'CONFIRMADO'}})
        expect(confirmed.statusCode).toBe(200)
        expect((await DayPlanModel.findById(plan._id))?.status).toBe('CONFIRMADO')
    })

    it('schedules a task through the real TaskService without resetting unrelated fields', async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        const headers = {Authorization: `Bearer ${accessToken}`}
        const task = await TaskModel.create({title: 'Schedule me', user: testSetup.rootUser._id, urgent: true,
            status: 'Pending', tags: ['keep'], priority: 'HIGH'})
        const plan = await DayPlanModel.create({date: new Date('2030-01-02'), user: testSetup.rootUser._id,
            status: 'BORRADOR', tasks: [{task: task._id}]})
        const calendar = {
            primaryBusy: vi.fn(async () => []), getPrimaryEvent: vi.fn(async () => null),
            createEvent: vi.fn(async ({event}) => event),
        }
        vi.spyOn(GoogleCalendarServiceFactory, 'instance', 'get').mockReturnValue(calendar as any)
        const options = {method: 'POST' as const, url: `/api/day-plans/${plan._id}/schedule-task`, headers,
            payload: {taskId: String(task._id), startAt: '2030-01-03T04:30:00Z', utcOffsetMinutes: -330}}
        const response = await testSetup.fastifyInstance.inject(options)
        expect(response.statusCode).toBe(200)
        expect(response.json()).toMatchObject({_id: String(plan._id), date: '2030-01-02T00:00:00.000Z',
            tasks: [{task: {_id: String(task._id), title: 'Schedule me', scheduledDate: '2030-01-03T04:30:00.000Z'}}]})
        expect(calendar.primaryBusy).toHaveBeenCalledWith(String(testSetup.rootUser._id),
            '2030-01-02T18:30:00.000Z', '2030-01-03T18:30:00.000Z')
        const saved = await TaskModel.findById(task._id)
        expect(saved).toMatchObject({urgent: true, status: 'Pending', priority: 'HIGH'})
        expect(saved?.tags).toEqual(['keep'])
        expect(saved?.calendarEventId).toBeTruthy()
        const retry = await testSetup.fastifyInstance.inject(options)
        expect(retry.statusCode).toBe(200)
        expect(retry.json()).toEqual(response.json())
        expect(retry.json().tasks[0].task.calendarEventId).toBe(saved?.calendarEventId)
        expect((await DayPlanModel.findById(plan._id))?.date).toEqual(new Date('2030-01-02T00:00:00Z'))
        expect(calendar.createEvent).toHaveBeenCalledOnce()
    })

    it('accepts query offsets and rejects invalid offsets even without Fastify validation', async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        const headers = {Authorization: `Bearer ${accessToken}`}
        const calendar = {primaryBusy: vi.fn(async () => [])}
        vi.spyOn(GoogleCalendarServiceFactory, 'instance', 'get').mockReturnValue(calendar as any)
        const response = await testSetup.fastifyInstance.inject({method: 'GET',
            url: '/api/day-plans/available-slots?date=2030-01-03&utcOffsetMinutes=210', headers})
        expect(response.statusCode).toBe(200)
        expect(response.json().slots[0].startAt).toBe('2030-01-03T03:30:00.000Z')
        for (const offset of [-841, 841, 0.5]) {
            const slots = await testSetup.fastifyInstance.inject({method: 'GET',
                url: `/api/day-plans/available-slots?date=2030-01-03&utcOffsetMinutes=${offset}`, headers})
            expect(slots.statusCode).toBe(422)
            const scheduled = await testSetup.fastifyInstance.inject({method: 'POST',
                url: '/api/day-plans/555555555555555555555555/schedule-task', headers,
                payload: {taskId: '222222222222222222222222', startAt: '2030-01-03T10:00:00Z', utcOffsetMinutes: offset}})
            expect(scheduled.statusCode).toBe(422)
        }
    })

    it('rejects invalid dates even when Fastify validation is disabled', async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        const headers = {Authorization: `Bearer ${accessToken}`}
        const response = await testSetup.fastifyInstance.inject({method: 'POST', url: '/api/day-plans/generate', headers, payload: {date: '2030-02-30'}})
        expect(response.statusCode).toBe(422)
    })

    it('rejects unauthenticated and unprivileged planning requests', async () => {
        const url = '/api/day-plans/planning?date=2030-01-02'
        expect((await testSetup.fastifyInstance.inject({method: 'GET', url})).statusCode).toBe(401)
        const {accessToken} = await testSetup.basicUserLogin()
        const response = await testSetup.fastifyInstance.inject({method: 'GET', url, headers: {Authorization: `Bearer ${accessToken}`}})
        expect(response.statusCode).toBe(403)
    })

    it("omits orphaned task references when paginating day plans", async () => {
        const {accessToken} = await testSetup.rootUserLogin()
        const missingTaskId = new mongoose.Types.ObjectId()

        await DayPlanModel.create({
            date: new Date("2026-10-08T00:00:00.000Z"),
            user: testSetup.rootUser._id,
            status: "BORRADOR",
            tasks: [
                {
                    task: missingTaskId,
                    decision: "PENDIENTE"
                }
            ]
        })

        const response = await testSetup.fastifyInstance.inject({
            method: "GET",
            url: "/api/day-plans?page=1&limit=10&orderBy=&order=asc&search=&filters=",
            headers: {Authorization: `Bearer ${accessToken}`}
        })

        expect(response.statusCode).toBe(200)
        expect(response.json().items[0].tasks).toEqual([])
    })
})
