
import TaskSourceController from "../controllers/TaskSourceController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {TaskSourceSchema, TaskSourceBaseSchema} from '../schemas/TaskSourceSchema.js'

async function TaskSourceFastifyRoutes(fastify, options) {

    const controller: TaskSourceController = new TaskSourceController()
    const schemas = new CrudSchemaBuilder(TaskSourceSchema, TaskSourceBaseSchema,TaskSourceBaseSchema, 'TaskSource', 'openapi-3.0', ['TaskSource']);

    fastify.get('/api/task-sources', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/task-sources/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/task-sources/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/task-sources/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/task-sources/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/task-sources/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/task-sources', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/task-sources/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/task-sources/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/task-sources/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/task-sources/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/task-sources/import', (req,rep) => controller.import(req,rep))
    
}

export default TaskSourceFastifyRoutes;
export {TaskSourceFastifyRoutes}
