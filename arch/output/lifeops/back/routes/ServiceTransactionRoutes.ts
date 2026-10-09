
import ServiceTransactionController from "../controllers/ServiceTransactionController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {ServiceTransactionSchema, ServiceTransactionBaseSchema} from '../schemas/ServiceTransactionSchema.js'

async function ServiceTransactionFastifyRoutes(fastify, options) {

    const controller: ServiceTransactionController = new ServiceTransactionController()
    const schemas = new CrudSchemaBuilder(ServiceTransactionSchema, ServiceTransactionBaseSchema,ServiceTransactionBaseSchema, 'ServiceTransaction', 'openapi-3.0', ['ServiceTransaction']);

    fastify.get('/api/service-transactions', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/service-transactions/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))

    fastify.get('/api/service-transactions/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.get('/api/service-transactions/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))

    fastify.get('/api/service-transactions/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.get('/api/service-transactions/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/service-transactions', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/service-transactions/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.patch('/api/service-transactions/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/service-transactions/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))

    fastify.get('/api/service-transactions/export', (req,rep) =>controller.export(req,rep))

    fastify.post('/api/service-transactions/import', (req,rep) => controller.import(req,rep))

}

export default ServiceTransactionFastifyRoutes;
export {ServiceTransactionFastifyRoutes}
