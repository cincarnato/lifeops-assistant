
import PurposeController from "../controllers/PurposeController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {PurposeSchema, PurposeBaseSchema} from '../schemas/PurposeSchema.js'

async function PurposeFastifyRoutes(fastify, options) {

    const controller: PurposeController = new PurposeController()
    const schemas = new CrudSchemaBuilder(PurposeSchema, PurposeBaseSchema,PurposeBaseSchema, 'Purpose', 'openapi-3.0', ['Purpose']);

    fastify.get('/api/purposes', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/purposes/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/purposes/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/purposes/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/purposes/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/purposes/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/purposes', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/purposes/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/purposes/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/purposes/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/purposes/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/purposes/import', (req,rep) => controller.import(req,rep))
    
}

export default PurposeFastifyRoutes;
export {PurposeFastifyRoutes}
