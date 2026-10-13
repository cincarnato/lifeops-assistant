import DelegateController from "../controllers/DelegateController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {DelegateSchema, DelegateBaseSchema} from '../schemas/DelegateSchema.js'

async function DelegateFastifyRoutes(fastify, options) {

    const controller: DelegateController = new DelegateController()
    const schemas = new CrudSchemaBuilder(DelegateSchema, DelegateBaseSchema,DelegateBaseSchema, 'Delegate', 'openapi-3.0', ['Delegate']);

    fastify.get('/api/delegates', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/delegates/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))

    fastify.get('/api/delegates/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.get('/api/delegates/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))

    fastify.get('/api/delegates/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.get('/api/delegates/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/delegates', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/delegates/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.patch('/api/delegates/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/delegates/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))

    fastify.get('/api/delegates/export', (req,rep) =>controller.export(req,rep))

    fastify.post('/api/delegates/import', (req,rep) => controller.import(req,rep))

}

export default DelegateFastifyRoutes;
export {DelegateFastifyRoutes}
