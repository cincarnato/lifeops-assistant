
import SourceController from "../controllers/SourceController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {SourceSchema, SourceBaseSchema} from '../schemas/SourceSchema.js'

async function SourceFastifyRoutes(fastify, options) {

    const controller: SourceController = new SourceController()
    const schemas = new CrudSchemaBuilder(SourceSchema, SourceBaseSchema,SourceBaseSchema, 'Source', 'openapi-3.0', ['Source']);

    fastify.get('/api/sources', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/sources/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/sources/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/sources/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/sources/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/sources/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/sources', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/sources/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/sources/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/sources/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/sources/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/sources/import', (req,rep) => controller.import(req,rep))
    
}

export default SourceFastifyRoutes;
export {SourceFastifyRoutes}
