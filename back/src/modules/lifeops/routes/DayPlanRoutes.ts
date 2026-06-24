
import DayPlanController from "../controllers/DayPlanController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {DayPlanSchema, DayPlanBaseSchema} from '../schemas/DayPlanSchema.js'

async function DayPlanFastifyRoutes(fastify, options) {

    const controller: DayPlanController = new DayPlanController()
    const schemas = new CrudSchemaBuilder(DayPlanSchema, DayPlanBaseSchema,DayPlanBaseSchema, 'DayPlan', 'openapi-3.0', ['DayPlan']);

    fastify.get('/api/day-plans', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/day-plans/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/day-plans/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.post('/api/day-plans/generate/today', {
        schema: {
            tags: ['DayPlan'],
        }
    }, (req, rep) => controller.generateToday(req as any, rep))
    
    fastify.get('/api/day-plans/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/day-plans/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/day-plans/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/day-plans', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/day-plans/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/day-plans/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/day-plans/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/day-plans/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/day-plans/import', (req,rep) => controller.import(req,rep))
    
}

export default DayPlanFastifyRoutes;
export {DayPlanFastifyRoutes}
