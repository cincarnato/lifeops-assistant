
import TaskScheduleController from "../controllers/TaskScheduleController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {TaskScheduleSchema, TaskScheduleBaseSchema} from '../schemas/TaskScheduleSchema.js'

async function TaskScheduleFastifyRoutes(fastify, options) {

    const controller: TaskScheduleController = new TaskScheduleController()
    const schemas = new CrudSchemaBuilder(TaskScheduleSchema, TaskScheduleBaseSchema,TaskScheduleBaseSchema, 'TaskSchedule', 'openapi-3.0', ['TaskSchedule']);

    fastify.get('/api/task-schedules', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/task-schedules/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/task-schedules/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/task-schedules/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/task-schedules/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/task-schedules/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/task-schedules', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/task-schedules/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/task-schedules/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/task-schedules/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/task-schedules/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/task-schedules/import', (req,rep) => controller.import(req,rep))
    
}

export default TaskScheduleFastifyRoutes;
export {TaskScheduleFastifyRoutes}
