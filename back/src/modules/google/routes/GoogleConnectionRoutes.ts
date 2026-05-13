
import GoogleConnectionController from "../controllers/GoogleConnectionController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {GoogleConnectionSchema, GoogleConnectionBaseSchema} from '../schemas/GoogleConnectionSchema.js'

async function GoogleConnectionFastifyRoutes(fastify, options) {

    const controller: GoogleConnectionController = new GoogleConnectionController()
    const schemas = new CrudSchemaBuilder(GoogleConnectionSchema, GoogleConnectionBaseSchema,GoogleConnectionBaseSchema, 'GoogleConnection', 'openapi-3.0', ['GoogleConnection']);

    fastify.get('/api/google-connections', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/google-connections/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/google-connections/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/google-connections/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/google-connections/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/google-connections/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/google-connections', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/google-connections/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/google-connections/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/google-connections/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/google-connections/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/google-connections/import', (req,rep) => controller.import(req,rep))
    
}

export default GoogleConnectionFastifyRoutes;
export {GoogleConnectionFastifyRoutes}
