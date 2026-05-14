
import MemoryTypeController from "../controllers/MemoryTypeController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {MemoryTypeSchema, MemoryTypeBaseSchema} from '../schemas/MemoryTypeSchema.js'

async function MemoryTypeFastifyRoutes(fastify, options) {

    const controller: MemoryTypeController = new MemoryTypeController()
    const schemas = new CrudSchemaBuilder(MemoryTypeSchema, MemoryTypeBaseSchema,MemoryTypeBaseSchema, 'MemoryType', 'openapi-3.0', ['MemoryType']);

    fastify.get('/api/memory-types', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/memory-types/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/memory-types/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/memory-types/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/memory-types/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/memory-types/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/memory-types', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/memory-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/memory-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/memory-types/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/memory-types/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/memory-types/import', (req,rep) => controller.import(req,rep))
    
}

export default MemoryTypeFastifyRoutes;
export {MemoryTypeFastifyRoutes}
