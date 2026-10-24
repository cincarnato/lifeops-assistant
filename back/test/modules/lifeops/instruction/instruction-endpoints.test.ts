import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest'
import TestSetup from '../../../setup/TestSetup'
import InstructionRoutes from '../../../../src/modules/lifeops/routes/InstructionRoutes'
import InstructionPermissions from '../../../../src/modules/lifeops/permissions/InstructionPermissions'
import InstructionServiceFactory from '../../../../src/modules/lifeops/factory/services/InstructionServiceFactory'
import {InstructionModel} from '../../../../src/modules/lifeops/models/InstructionModel'
import TaskRoutes from '../../../../src/modules/lifeops/routes/TaskRoutes'
import TaskPermissions from '../../../../src/modules/lifeops/permissions/TaskPermissions'
import {TaskModel} from '../../../../src/modules/lifeops/models/TaskModel'
import {TaskBaseSchema} from '../../../../src/modules/lifeops/schemas/TaskSchema'
import {TaskScheduleBaseSchema} from '../../../../src/modules/lifeops/schemas/TaskScheduleSchema'

describe('Instruction library and task instructions', () => {
    const testSetup = new TestSetup({
        routes: [InstructionRoutes, TaskRoutes],
        permissions: [InstructionPermissions, TaskPermissions]
    })
    let headers: {Authorization: string}

    beforeAll(async () => {
        await testSetup.setup()
        const {accessToken} = await testSetup.rootUserLogin()
        headers = {Authorization: `Bearer ${accessToken}`}
    })

    beforeEach(async () => {
        await Promise.all([InstructionModel.deleteMany({}), TaskModel.deleteMany({})])
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
    })

    async function createInstruction() {
        return InstructionServiceFactory.instance.create({
            title: 'Pagar tarjeta', content: '1. Revisar resumen\n2. Pagar saldo'
        })
    }

    it('creates, reads, updates and deletes library instructions', async () => {
        const created = await testSetup.fastifyInstance.inject({
            method: 'POST', url: '/api/instructions', headers,
            payload: {title: 'Pagar tarjeta', content: 'Revisar resumen'}
        })
        expect(created.statusCode).toBe(200)
        const instruction = created.json()
        expect(instruction).toMatchObject({title: 'Pagar tarjeta', content: 'Revisar resumen'})
        expect(instruction).not.toHaveProperty('description')
        const read = await testSetup.fastifyInstance.inject({method: 'GET', url: `/api/instructions/${instruction._id}`, headers})
        expect(read.statusCode).toBe(200)
        expect(read.json()).toEqual(instruction)
        const updated = await testSetup.fastifyInstance.inject({
            method: 'PUT', url: `/api/instructions/${instruction._id}`, headers,
            payload: {title: 'Pagar resumen', content: 'Revisar y pagar'}
        })
        expect(updated.statusCode).toBe(200)
        const patched = await testSetup.fastifyInstance.inject({
            method: 'PATCH', url: `/api/instructions/${instruction._id}`, headers, payload: {title: 'Pago mensual'}
        })
        expect(patched.statusCode).toBe(200)
        expect(patched.json()).toMatchObject({title: 'Pago mensual', content: 'Revisar y pagar'})
        const deleted = await testSetup.fastifyInstance.inject({method: 'DELETE', url: `/api/instructions/${instruction._id}`, headers})
        expect(deleted.statusCode).toBe(200)
        const missing = await testSetup.fastifyInstance.inject({method: 'GET', url: `/api/instructions/${instruction._id}`, headers})
        expect(missing.statusCode).toBe(404)
    })

    it('paginates and searches the library', async () => {
        await createInstruction()
        const paginated = await testSetup.fastifyInstance.inject({method: 'GET', url: '/api/instructions', headers})
        expect(paginated.statusCode).toBe(200)
        expect(paginated.json().total).toBe(1)
        const searched = await testSetup.fastifyInstance.inject({method: 'GET', url: '/api/instructions/search?search=tarjeta', headers})
        expect(searched.statusCode).toBe(200)
        expect(searched.json()).toHaveLength(1)
    })

    it.each([{content: 'Steps'}, {title: 'Title'}, {title: '', content: 'Steps'}, {title: 'Title', content: ''}])('requires title and content: %j', async payload => {
        const response = await testSetup.fastifyInstance.inject({method: 'POST', url: '/api/instructions', headers, payload})
        expect([400, 422]).toContain(response.statusCode)
    })

    it('filters and groups instructions by title', async () => {
        await createInstruction()
        const filtered = await testSetup.fastifyInstance.inject({
            method: 'GET', url: '/api/instructions/find?filters=title;eq;Pagar%20tarjeta', headers
        })
        expect(filtered.statusCode).toBe(200)
        expect(filtered.json()).toHaveLength(1)
        const grouped = await testSetup.fastifyInstance.inject({
            method: 'GET', url: '/api/instructions/group-by?fields=title', headers
        })
        expect(grouped.statusCode).toBe(200)
        expect(grouped.json()).toHaveLength(1)
        expect(grouped.json()[0].count).toBe(1)
    })

    it('rejects invalid identifiers and updates of missing instructions', async () => {
        const invalid = await testSetup.fastifyInstance.inject({method: 'GET', url: '/api/instructions/invalid-id', headers})
        expect(invalid.statusCode).toBe(400)
        const missing = await testSetup.fastifyInstance.inject({
            method: 'PATCH', url: '/api/instructions/123456789012345678901234', headers, payload: {title: 'Missing'}
        })
        expect(missing.statusCode).toBe(404)
    })

    it('requires authentication and permission', async () => {
        const anonymous = await testSetup.fastifyInstance.inject({method: 'GET', url: '/api/instructions'})
        expect(anonymous.statusCode).toBe(401)
        const {accessToken} = await testSetup.basicUserLogin()
        const forbidden = await testSetup.fastifyInstance.inject({
            method: 'GET', url: '/api/instructions', headers: {Authorization: `Bearer ${accessToken}`}
        })
        expect(forbidden.statusCode).toBe(403)
    })

    it('allows tasks without instructions and associates, preserves and clears an instruction', async () => {
        const instruction = await createInstruction()
        const created = await testSetup.fastifyInstance.inject({
            method: 'POST', url: '/api/tasks', headers, payload: {title: 'Pagar'}
        })
        expect(created.statusCode).toBe(200)
        expect(created.json().instruction).toBeUndefined()
        const taskId = created.json()._id
        const associated = await testSetup.fastifyInstance.inject({
            method: 'PATCH', url: `/api/tasks/${taskId}`, headers, payload: {instruction: instruction._id}
        })
        expect(associated.statusCode).toBe(200)
        expect(associated.json().instruction).toMatchObject({
            _id: instruction._id, title: instruction.title, content: instruction.content
        })
        expect(associated.json().instruction).not.toHaveProperty('tenant')
        const preserved = await testSetup.fastifyInstance.inject({
            method: 'PATCH', url: `/api/tasks/${taskId}`, headers, payload: {title: 'Pagar hoy'}
        })
        expect(preserved.statusCode).toBe(200)
        expect(preserved.json().instruction._id).toBe(instruction._id)
        const cleared = await testSetup.fastifyInstance.inject({
            method: 'PATCH', url: `/api/tasks/${taskId}`, headers, payload: {instruction: null}
        })
        expect(cleared.statusCode).toBe(200)
        expect(cleared.json().instruction).toBeNull()
    })

    it('does not inject an instruction into partial task or schedule inputs', () => {
        const task = TaskBaseSchema.partial().parse({title: 'Updated'})
        expect(task).not.toHaveProperty('instruction')
        const schedule = TaskScheduleBaseSchema.shape.task.partial().parse({title: 'Updated'})
        expect(schedule).not.toHaveProperty('instruction')
        expect(TaskBaseSchema.safeParse({title: 'Task', user: 'user', instruction: 'invalid'}).success).toBe(false)
    })
})
