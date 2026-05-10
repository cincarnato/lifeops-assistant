
import ProjectController from "../controllers/ProjectController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {ProjectSchema, ProjectBaseSchema} from '../schemas/ProjectSchema.js'

async function ProjectFastifyRoutes(fastify, options) {

    const controller: ProjectController = new ProjectController()
    const schemas = new CrudSchemaBuilder(ProjectSchema, ProjectBaseSchema,ProjectBaseSchema, 'Project', 'openapi-3.0', ['Project']);

    fastify.get('/api/projects', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/projects/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/projects/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/projects/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/projects/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/projects/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/projects', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/projects/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/projects/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/projects/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/projects/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/projects/import', (req,rep) => controller.import(req,rep))
    
}

export default ProjectFastifyRoutes;
export {ProjectFastifyRoutes}
