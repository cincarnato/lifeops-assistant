
import PriorityController from "../controllers/PriorityController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {PrioritySchema, PriorityBaseSchema} from '../schemas/PrioritySchema.js'

async function PriorityFastifyRoutes(fastify, options) {

    const controller: PriorityController = new PriorityController()
    const schemas = new CrudSchemaBuilder(PrioritySchema, PriorityBaseSchema,PriorityBaseSchema, 'Priority', 'openapi-3.0', ['Priority']);

    fastify.get('/api/priorities', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/priorities/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/priorities/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/priorities/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/priorities/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/priorities/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/priorities', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/priorities/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/priorities/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/priorities/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/priorities/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/priorities/import', (req,rep) => controller.import(req,rep))
    
}

export default PriorityFastifyRoutes;
export {PriorityFastifyRoutes}
