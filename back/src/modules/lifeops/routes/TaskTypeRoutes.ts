
import TaskTypeController from "../controllers/TaskTypeController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {TaskTypeSchema, TaskTypeBaseSchema} from '../schemas/TaskTypeSchema.js'

async function TaskTypeFastifyRoutes(fastify, options) {

    const controller: TaskTypeController = new TaskTypeController()
    const schemas = new CrudSchemaBuilder(TaskTypeSchema, TaskTypeBaseSchema,TaskTypeBaseSchema, 'TaskType', 'openapi-3.0', ['TaskType']);

    fastify.get('/api/task-types', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/task-types/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/task-types/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/task-types/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/task-types/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/task-types/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/task-types', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/task-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/task-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/task-types/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/task-types/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/task-types/import', (req,rep) => controller.import(req,rep))
    
}

export default TaskTypeFastifyRoutes;
export {TaskTypeFastifyRoutes}
