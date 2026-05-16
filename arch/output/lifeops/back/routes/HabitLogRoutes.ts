
import HabitLogController from "../controllers/HabitLogController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {HabitLogSchema, HabitLogBaseSchema} from '../schemas/HabitLogSchema.js'

async function HabitLogFastifyRoutes(fastify, options) {

    const controller: HabitLogController = new HabitLogController()
    const schemas = new CrudSchemaBuilder(HabitLogSchema, HabitLogBaseSchema,HabitLogBaseSchema, 'HabitLog', 'openapi-3.0', ['HabitLog']);

    fastify.get('/api/habit-logs', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/habit-logs/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/habit-logs/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/habit-logs/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/habit-logs/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/habit-logs/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/habit-logs', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/habit-logs/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/habit-logs/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/habit-logs/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/habit-logs/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/habit-logs/import', (req,rep) => controller.import(req,rep))
    
}

export default HabitLogFastifyRoutes;
export {HabitLogFastifyRoutes}
