
import ClientTypeController from "../controllers/ClientTypeController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {ClientTypeSchema, ClientTypeBaseSchema} from '../schemas/ClientTypeSchema.js'

async function ClientTypeFastifyRoutes(fastify, options) {

    const controller: ClientTypeController = new ClientTypeController()
    const schemas = new CrudSchemaBuilder(ClientTypeSchema, ClientTypeBaseSchema,ClientTypeBaseSchema, 'ClientType', 'openapi-3.0', ['ClientType']);

    fastify.get('/api/client-types', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/client-types/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/client-types/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/client-types/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/client-types/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/client-types/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/client-types', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/client-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/client-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/client-types/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/client-types/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/client-types/import', (req,rep) => controller.import(req,rep))
    
}

export default ClientTypeFastifyRoutes;
export {ClientTypeFastifyRoutes}
