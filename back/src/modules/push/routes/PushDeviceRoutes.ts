
import PushDeviceController from "../controllers/PushDeviceController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {PushDeviceSchema, PushDeviceBaseSchema} from '../schemas/PushDeviceSchema.js'

async function PushDeviceFastifyRoutes(fastify, options) {

    const controller: PushDeviceController = new PushDeviceController()
    const schemas = new CrudSchemaBuilder(PushDeviceSchema, PushDeviceBaseSchema,PushDeviceBaseSchema, 'PushDevice', 'openapi-3.0', ['PushDevice']);

    fastify.get('/api/push-devices', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/push-devices/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/push-devices/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.post('/api/push-devices/register', {
        schema: {
            tags: ['PushDevice'],
            body: {
                type: 'object',
                required: ['platform', 'token'],
                properties: {
                    platform: {type: 'string', enum: ['android', 'ios', 'web']},
                    token: {type: 'string'},
                    deviceName: {type: 'string'},
                    enabled: {type: 'boolean', default: true},
                },
            },
        },
    }, (req, rep) => controller.register(req, rep))
    
    fastify.get('/api/push-devices/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/push-devices/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/push-devices/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/push-devices', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/push-devices/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/push-devices/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/push-devices/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/push-devices/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/push-devices/import', (req,rep) => controller.import(req,rep))
    
}

export default PushDeviceFastifyRoutes;
export {PushDeviceFastifyRoutes}
