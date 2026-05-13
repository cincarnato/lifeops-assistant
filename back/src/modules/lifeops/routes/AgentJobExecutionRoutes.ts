
import AgentJobExecutionController from "../controllers/AgentJobExecutionController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {AgentJobExecutionSchema, AgentJobExecutionBaseSchema} from '../schemas/AgentJobExecutionSchema.js'

async function AgentJobExecutionFastifyRoutes(fastify, options) {

    const controller: AgentJobExecutionController = new AgentJobExecutionController()
    const schemas = new CrudSchemaBuilder(AgentJobExecutionSchema, AgentJobExecutionBaseSchema,AgentJobExecutionBaseSchema, 'AgentJobExecution', 'openapi-3.0', ['AgentJobExecution']);

    fastify.get('/api/agent-job-executions', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/agent-job-executions/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/agent-job-executions/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/agent-job-executions/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/agent-job-executions/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/agent-job-executions/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/agent-job-executions', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/agent-job-executions/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/agent-job-executions/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/agent-job-executions/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/agent-job-executions/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/agent-job-executions/import', (req,rep) => controller.import(req,rep))
    
}

export default AgentJobExecutionFastifyRoutes;
export {AgentJobExecutionFastifyRoutes}
