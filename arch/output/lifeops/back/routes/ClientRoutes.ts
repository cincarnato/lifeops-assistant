
import ClientController from "../controllers/ClientController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {ClientSchema, ClientBaseSchema} from '../schemas/ClientSchema.js'

async function ClientFastifyRoutes(fastify, options) {

    const controller: ClientController = new ClientController()
    const schemas = new CrudSchemaBuilder(ClientSchema, ClientBaseSchema,ClientBaseSchema, 'Client', 'openapi-3.0', ['Client']);

    fastify.get('/api/clients', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/clients/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/clients/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/clients/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/clients/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/clients/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/clients', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/clients/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/clients/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/clients/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/clients/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/clients/import', (req,rep) => controller.import(req,rep))
    
}

export default ClientFastifyRoutes;
export {ClientFastifyRoutes}
