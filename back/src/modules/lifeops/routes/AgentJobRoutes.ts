
import AgentJobController from "../controllers/AgentJobController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {AgentJobSchema, AgentJobBaseSchema} from '../schemas/AgentJobSchema.js'

async function AgentJobFastifyRoutes(fastify, options) {

    const controller: AgentJobController = new AgentJobController()
    const schemas = new CrudSchemaBuilder(AgentJobSchema, AgentJobBaseSchema,AgentJobBaseSchema, 'AgentJob', 'openapi-3.0', ['AgentJob']);

    fastify.get('/api/agent-jobs', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/agent-jobs/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/agent-jobs/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/agent-jobs/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/agent-jobs/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/agent-jobs/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/agent-jobs', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/agent-jobs/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/agent-jobs/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/agent-jobs/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/agent-jobs/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/agent-jobs/import', (req,rep) => controller.import(req,rep))
    
}

export default AgentJobFastifyRoutes;
export {AgentJobFastifyRoutes}
