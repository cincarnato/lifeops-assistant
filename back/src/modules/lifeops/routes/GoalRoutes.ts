
import GoalController from "../controllers/GoalController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {GoalSchema, GoalBaseSchema} from '../schemas/GoalSchema.js'

async function GoalFastifyRoutes(fastify, options) {

    const controller: GoalController = new GoalController()
    const schemas = new CrudSchemaBuilder(GoalSchema, GoalBaseSchema,GoalBaseSchema, 'Goal', 'openapi-3.0', ['Goal']);

    fastify.get('/api/goals', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/goals/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))

    fastify.get('/api/goals/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.get('/api/goals/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))

    fastify.get('/api/goals/ids/:ids', {schema: schemas.findByIdsSchema}, (req,rep) => controller.findByIds(req,rep))

    fastify.get('/api/goals/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.get('/api/goals/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/goals', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/goals/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.patch('/api/goals/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/goals/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))

    fastify.get('/api/goals/export', (req,rep) =>controller.export(req,rep))

    fastify.post('/api/goals/import', (req,rep) => controller.import(req,rep))

}

export default GoalFastifyRoutes;
export {GoalFastifyRoutes}
