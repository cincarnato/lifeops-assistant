
import TaskController from "../controllers/TaskController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {TaskSchema, TaskBaseSchema} from '../schemas/TaskSchema.js'

async function TaskFastifyRoutes(fastify, options) {

    const controller: TaskController = new TaskController()
    const schemas = new CrudSchemaBuilder(TaskSchema, TaskBaseSchema,TaskBaseSchema, 'Task', 'openapi-3.0', ['Task']);

    fastify.get('/api/tasks', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/tasks/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/tasks/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/tasks/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/tasks/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/tasks/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/tasks', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/tasks/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/tasks/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/tasks/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/tasks/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/tasks/import', (req,rep) => controller.import(req,rep))
    
}

export default TaskFastifyRoutes;
export {TaskFastifyRoutes}
