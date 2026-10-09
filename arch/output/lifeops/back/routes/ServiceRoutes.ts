
import ServiceController from "../controllers/ServiceController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {ServiceSchema, ServiceBaseSchema} from '../schemas/ServiceSchema.js'

async function ServiceFastifyRoutes(fastify, options) {

    const controller: ServiceController = new ServiceController()
    const schemas = new CrudSchemaBuilder(ServiceSchema, ServiceBaseSchema,ServiceBaseSchema, 'Service', 'openapi-3.0', ['Service']);

    fastify.get('/api/services', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/services/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))

    fastify.get('/api/services/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.get('/api/services/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))

    fastify.get('/api/services/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.get('/api/services/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/services', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/services/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.patch('/api/services/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/services/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))

    fastify.get('/api/services/export', (req,rep) =>controller.export(req,rep))

    fastify.post('/api/services/import', (req,rep) => controller.import(req,rep))

}

export default ServiceFastifyRoutes;
export {ServiceFastifyRoutes}
