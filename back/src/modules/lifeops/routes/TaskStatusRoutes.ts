
import TaskStatusController from "../controllers/TaskStatusController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {TaskStatusSchema, TaskStatusBaseSchema} from '../schemas/TaskStatusSchema.js'

async function TaskStatusFastifyRoutes(fastify, options) {

    const controller: TaskStatusController = new TaskStatusController()
    const schemas = new CrudSchemaBuilder(TaskStatusSchema, TaskStatusBaseSchema,TaskStatusBaseSchema, 'TaskStatus', 'openapi-3.0', ['TaskStatus']);

    fastify.get('/api/task-statuses', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/task-statuses/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/task-statuses/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/task-statuses/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/task-statuses/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/task-statuses/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/task-statuses', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/task-statuses/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/task-statuses/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/task-statuses/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/task-statuses/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/task-statuses/import', (req,rep) => controller.import(req,rep))
    
}

export default TaskStatusFastifyRoutes;
export {TaskStatusFastifyRoutes}
