import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest'
import {mongoose} from '@drax/common-back'
import TestSetup from '../../../setup/TestSetup'
import DelegateRoutes from '../../../../src/modules/lifeops/routes/DelegateRoutes'
import DelegatePermissions from '../../../../src/modules/lifeops/permissions/DelegatePermissions'
import DelegateServiceFactory from '../../../../src/modules/lifeops/factory/services/DelegateServiceFactory'
import {DelegateModel} from '../../../../src/modules/lifeops/models/DelegateModel'
import {DelegateBaseSchema} from '../../../../src/modules/lifeops/schemas/DelegateSchema'
import {ContactModel} from '../../../../src/modules/lifeops/models/ContactModel'
import TaskRoutes from '../../../../src/modules/lifeops/routes/TaskRoutes'
import TaskPermissions from '../../../../src/modules/lifeops/permissions/TaskPermissions'
import TaskServiceFactory from '../../../../src/modules/lifeops/factory/services/TaskServiceFactory'
import {TaskModel} from '../../../../src/modules/lifeops/models/TaskModel'
import {TaskBaseSchema} from '../../../../src/modules/lifeops/schemas/TaskSchema'

describe('Delegate endpoints and task delegation', () => {
    const testSetup = new TestSetup({
        routes: [DelegateRoutes, TaskRoutes],
        permissions: [DelegatePermissions, TaskPermissions]
    })
    let headers: {Authorization: string}
    let contactId: string

    beforeAll(async () => {
        await testSetup.setup()
        const {accessToken} = await testSetup.rootUserLogin()
        headers = {Authorization: `Bearer ${accessToken}`}
    })

    beforeEach(async () => {
        await Promise.all([DelegateModel.deleteMany({}), TaskModel.deleteMany({}), ContactModel.deleteMany({})])
        const contact = await ContactModel.create({displayName: 'Ana Pérez', user: testSetup.rootUser._id})
        contactId = contact._id.toString()
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
    })

    async function createDelegate(active = true, user = testSetup.rootUser._id) {
        return DelegateServiceFactory.instance.create({contact: contactId, active, user, skills: ['Accounting']})
    }

    async function createTask(payload = {}) {
        const response = await testSetup.fastifyInstance.inject({
            method: 'POST', url: '/api/tasks', headers, payload: {title: 'Delegate this task', ...payload}
        })
        expect(response.statusCode).toBe(200)
        return response.json()
    }

    it('creates delegates with populated contact, authenticated owner and defaults', async () => {
        const response = await testSetup.fastifyInstance.inject({
            method: 'POST', url: '/api/delegates', headers,
            payload: {contact: contactId, user: testSetup.basicUser._id}
        })
        expect(response.statusCode).toBe(200)
        const delegate = response.json()
        expect(delegate.contact).toEqual({_id: contactId, displayName: 'Ana Pérez'})
        expect(delegate.user._id).toBe(testSetup.rootUser._id.toString())
        expect(delegate.active).toBe(true)
        expect(delegate.skills).toEqual([])
        const stored = await DelegateModel.findById(delegate._id).lean()
        expect(stored?.active).toBe(true)
        const read = await testSetup.fastifyInstance.inject({method: 'GET', url: `/api/delegates/${delegate._id}`, headers})
        expect(read.statusCode).toBe(200)
        expect(read.json()).toEqual(delegate)
    })

    it.each(['PUT', 'PATCH'] as const)('updates delegates without resetting active or skills using %s', async method => {
        const delegate = await createDelegate(false)
        const response = await testSetup.fastifyInstance.inject({
            method, url: `/api/delegates/${delegate._id}`, headers, payload: {description: 'Available on Mondays'}
        })
        expect(response.statusCode).toBe(200)
        expect(response.json()).toMatchObject({active: false, skills: ['Accounting'], description: 'Available on Mondays'})
    })

    it('deletes delegates', async () => {
        const delegate = await createDelegate()
        const response = await testSetup.fastifyInstance.inject({method: 'DELETE', url: `/api/delegates/${delegate._id}`, headers})
        expect(response.statusCode).toBe(200)
        expect(await DelegateModel.findById(delegate._id)).toBeNull()
    })

    it('paginates, searches, filters and groups delegates belonging to the user', async () => {
        await createDelegate()
        const inactive = await createDelegate(false)
        await DelegateServiceFactory.instance.updatePartial(inactive._id, {description: 'Technical support'} as any)
        const otherContact = await ContactModel.create({displayName: 'Other', user: testSetup.basicUser._id})
        await DelegateServiceFactory.instance.create({contact: otherContact._id.toString(), user: testSetup.basicUser._id})
        const pagination = await testSetup.fastifyInstance.inject({method: 'GET', url: '/api/delegates?page=1&limit=10', headers})
        expect(pagination.statusCode).toBe(200)
        expect(pagination.json().total).toBe(2)
        const search = await testSetup.fastifyInstance.inject({method: 'GET', url: '/api/delegates/search?search=Technical', headers})
        expect(search.statusCode).toBe(200)
        expect(search.json()).toHaveLength(1)
        const filtered = await testSetup.fastifyInstance.inject({method: 'GET', url: '/api/delegates/find?filters=active;eq;true', headers})
        expect(filtered.statusCode).toBe(200)
        expect(filtered.json()).toHaveLength(1)
        expect(filtered.json()[0].active).toBe(true)
        const grouped = await testSetup.fastifyInstance.inject({method: 'GET', url: '/api/delegates/group-by?fields=active', headers})
        expect(grouped.statusCode).toBe(200)
        expect(grouped.json()).toHaveLength(2)
    })

    it('requires authentication and CRUD permission', async () => {
        const anonymous = await testSetup.fastifyInstance.inject({method: 'GET', url: '/api/delegates'})
        expect(anonymous.statusCode).toBe(401)
        const {accessToken} = await testSetup.basicUserLogin()
        const forbidden = await testSetup.fastifyInstance.inject({
            method: 'POST', url: '/api/delegates', headers: {Authorization: `Bearer ${accessToken}`}, payload: {contact: contactId}
        })
        expect(forbidden.statusCode).toBe(403)
    })

    it.each([{}, {contact: null}, {contact: 'invalid'}, {contact: new mongoose.Types.ObjectId().toString()}])('rejects missing or invalid contacts: %j', async payload => {
        const response = await testSetup.fastifyInstance.inject({method: 'POST', url: '/api/delegates', headers, payload})
        expect(response.statusCode).toBe(422)
        expect(await DelegateModel.countDocuments()).toBe(0)
    })

    it('rejects contacts belonging to another user', async () => {
        const other = await ContactModel.create({displayName: 'Other contact', user: testSetup.basicUser._id})
        const response = await testSetup.fastifyInstance.inject({
            method: 'POST', url: '/api/delegates', headers, payload: {contact: other._id.toString()}
        })
        expect(response.statusCode).toBe(422)
    })

    it('returns errors for invalid or missing delegate ids', async () => {
        for (const [id, status] of [['invalid', 400], [new mongoose.Types.ObjectId().toString(), 404]] as const) {
            const response = await testSetup.fastifyInstance.inject({method: 'GET', url: `/api/delegates/${id}`, headers})
            expect(response.statusCode).toBe(status)
        }
    })

    it('creates tasks without assignment and supports delegable tasks without choosing a person', async () => {
        expect(await createTask()).toMatchObject({delegable: false})
        const task = await createTask({delegable: true})
        expect(task.delegable).toBe(true)
        expect(task.delegate ?? null).toBeNull()
    })

    it('creates and reads delegated tasks with populated contact names', async () => {
        const delegate = await createDelegate()
        const task = await createTask({delegable: true, delegate: delegate._id})
        expect(task.delegate).toMatchObject({_id: delegate._id, contact: {_id: contactId, displayName: 'Ana Pérez'}})
        const read = await testSetup.fastifyInstance.inject({method: 'GET', url: `/api/tasks/${task._id}`, headers})
        expect(read.statusCode).toBe(200)
        expect(read.json().delegate).toEqual(task.delegate)
        expect((await TaskModel.findById(task._id).lean())?.delegate?.toString()).toBe(delegate._id)
    })

    it('preserves delegation when a task is archived', async () => {
        const delegate = await createDelegate()
        const task = await createTask({delegable: true, delegate: delegate._id, archivedAt: new Date().toISOString()})
        await TaskServiceFactory.instance.archiveTask(task)
        expect(await TaskModel.findById(task._id)).toBeNull()
        const read = await testSetup.fastifyInstance.inject({method: 'GET', url: `/api/tasks/${task._id}`, headers})
        expect(read.statusCode).toBe(200)
        expect(read.json()).toMatchObject({delegable: true, delegate: {_id: delegate._id, contact: {displayName: 'Ana Pérez'}}})
    })

    it.each(['PUT', 'PATCH'] as const)('assigns, preserves and clears delegation using %s', async method => {
        const delegate = await createDelegate()
        const task = await createTask({delegable: true})
        for (const payload of [{delegate: delegate._id}, {title: 'Renamed'}]) {
            const response = await testSetup.fastifyInstance.inject({method, url: `/api/tasks/${task._id}`, headers, payload})
            expect(response.statusCode).toBe(200)
            expect(response.json()).toMatchObject({delegable: true, delegate: {_id: delegate._id}})
        }
        const cleared = await testSetup.fastifyInstance.inject({
            method, url: `/api/tasks/${task._id}`, headers, payload: {delegable: false}
        })
        expect(cleared.statusCode).toBe(200)
        expect(cleared.json()).toMatchObject({delegable: false, delegate: null})
        expect((await TaskModel.findById(task._id).lean())?.delegate).toBeNull()
    })

    it('clears the assignee while keeping the task delegable', async () => {
        const delegate = await createDelegate()
        const task = await createTask({delegable: true, delegate: delegate._id})
        const response = await testSetup.fastifyInstance.inject({
            method: 'PATCH', url: `/api/tasks/${task._id}`, headers, payload: {delegate: null}
        })
        expect(response.statusCode).toBe(200)
        expect(response.json()).toMatchObject({delegable: true, delegate: null})
    })

    it('rejects delegation without marking a task as delegable', async () => {
        const delegate = await createDelegate()
        const response = await testSetup.fastifyInstance.inject({
            method: 'POST', url: '/api/tasks', headers, payload: {title: 'Invalid', delegate: delegate._id}
        })
        expect(response.statusCode).toBe(422)
    })

    it('rejects inactive, missing and foreign delegates', async () => {
        const inactive = await createDelegate(false)
        const otherContact = await ContactModel.create({displayName: 'Other', user: testSetup.basicUser._id})
        const foreign = await DelegateServiceFactory.instance.create({contact: otherContact._id.toString(), user: testSetup.basicUser._id})
        for (const delegate of [inactive._id, foreign._id, new mongoose.Types.ObjectId().toString()]) {
            const response = await testSetup.fastifyInstance.inject({
                method: 'POST', url: '/api/tasks', headers, payload: {title: 'Invalid', delegable: true, delegate}
            })
            expect(response.statusCode).toBe(422)
        }
    })

    it('does not inject delegation defaults into partial schemas', () => {
        expect(TaskBaseSchema.partial().parse({title: 'Renamed'})).not.toHaveProperty('delegable')
        expect(TaskBaseSchema.partial().parse({title: 'Renamed'})).not.toHaveProperty('delegate')
        expect(DelegateBaseSchema.partial().parse({description: 'Changed'})).toEqual({description: 'Changed'})
    })

    it.each([{delegable: 'true'}, {delegate: 'invalid'}, {delegate: 123}])('rejects invalid task delegation types: %j', async payload => {
        const response = await testSetup.fastifyInstance.inject({
            method: 'POST', url: '/api/tasks', headers, payload: {title: 'Invalid', ...payload}
        })
        expect(response.statusCode).toBe(422)
    })
})
