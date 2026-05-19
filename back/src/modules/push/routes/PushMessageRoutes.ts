
import PushMessageController from "../controllers/PushMessageController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {PushMessageSchema, PushMessageBaseSchema} from '../schemas/PushMessageSchema.js'

async function PushMessageFastifyRoutes(fastify, options) {

    const controller: PushMessageController = new PushMessageController()
    const schemas = new CrudSchemaBuilder(PushMessageSchema, PushMessageBaseSchema,PushMessageBaseSchema, 'PushMessage', 'openapi-3.0', ['PushMessage']);

    fastify.get('/api/push-messages', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/push-messages/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/push-messages/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.post('/api/push-messages/test', {
        schema: {
            tags: ['PushMessage'],
            body: {
                type: 'object',
                required: ['pushDeviceId', 'title', 'body'],
                properties: {
                    pushDeviceId: {type: 'string'},
                    title: {type: 'string'},
                    body: {type: 'string'},
                    type: {type: 'string', default: 'test'},
                },
            },
        },
    }, (req, rep) => controller.sendTest(req as any, rep))
    
    fastify.get('/api/push-messages/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/push-messages/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/push-messages/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/push-messages', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/push-messages/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/push-messages/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/push-messages/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/push-messages/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/push-messages/import', (req,rep) => controller.import(req,rep))
    
}

export default PushMessageFastifyRoutes;
export {PushMessageFastifyRoutes}
