
import HabitController from "../controllers/HabitController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {HabitSchema, HabitBaseSchema} from '../schemas/HabitSchema.js'

async function HabitFastifyRoutes(fastify, options) {

    const controller: HabitController = new HabitController()
    const schemas = new CrudSchemaBuilder(HabitSchema, HabitBaseSchema,HabitBaseSchema, 'Habit', 'openapi-3.0', ['Habit']);

    fastify.get('/api/habits', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/habits/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/habits/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/habits/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/habits/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/habits/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/habits', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/habits/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/habits/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/habits/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/habits/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/habits/import', (req,rep) => controller.import(req,rep))
    
}

export default HabitFastifyRoutes;
export {HabitFastifyRoutes}
