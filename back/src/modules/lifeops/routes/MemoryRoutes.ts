
import MemoryController from "../controllers/MemoryController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {MemorySchema, MemoryBaseSchema} from '../schemas/MemorySchema.js'

async function MemoryFastifyRoutes(fastify, options) {

    const controller: MemoryController = new MemoryController()
    const schemas = new CrudSchemaBuilder(MemorySchema, MemoryBaseSchema,MemoryBaseSchema, 'Memory', 'openapi-3.0', ['Memory']);

    fastify.get('/api/memories', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/memories/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/memories/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/memories/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/memories/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/memories/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/memories', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/memories/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/memories/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/memories/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/memories/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/memories/import', (req,rep) => controller.import(req,rep))
    
}

export default MemoryFastifyRoutes;
export {MemoryFastifyRoutes}
