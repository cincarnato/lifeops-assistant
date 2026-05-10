
import TaskPriorityController from "../controllers/TaskPriorityController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {TaskPrioritySchema, TaskPriorityBaseSchema} from '../schemas/TaskPrioritySchema.js'

async function TaskPriorityFastifyRoutes(fastify, options) {

    const controller: TaskPriorityController = new TaskPriorityController()
    const schemas = new CrudSchemaBuilder(TaskPrioritySchema, TaskPriorityBaseSchema,TaskPriorityBaseSchema, 'TaskPriority', 'openapi-3.0', ['TaskPriority']);

    fastify.get('/api/task-priorities', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/task-priorities/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/task-priorities/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/task-priorities/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/task-priorities/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/task-priorities/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/task-priorities', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/task-priorities/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/task-priorities/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/task-priorities/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/task-priorities/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/task-priorities/import', (req,rep) => controller.import(req,rep))
    
}

export default TaskPriorityFastifyRoutes;
export {TaskPriorityFastifyRoutes}
