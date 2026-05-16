
import LifeAreaController from "../controllers/LifeAreaController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {LifeAreaSchema, LifeAreaBaseSchema} from '../schemas/LifeAreaSchema.js'

async function LifeAreaFastifyRoutes(fastify, options) {

    const controller: LifeAreaController = new LifeAreaController()
    const schemas = new CrudSchemaBuilder(LifeAreaSchema, LifeAreaBaseSchema,LifeAreaBaseSchema, 'LifeArea', 'openapi-3.0', ['LifeArea']);

    fastify.get('/api/life-areas', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/life-areas/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/life-areas/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/life-areas/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/life-areas/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/life-areas/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/life-areas', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/life-areas/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/life-areas/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/life-areas/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/life-areas/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/life-areas/import', (req,rep) => controller.import(req,rep))
    
}

export default LifeAreaFastifyRoutes;
export {LifeAreaFastifyRoutes}
