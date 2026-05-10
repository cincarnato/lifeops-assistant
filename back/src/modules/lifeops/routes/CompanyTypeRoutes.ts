
import CompanyTypeController from "../controllers/CompanyTypeController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {CompanyTypeSchema, CompanyTypeBaseSchema} from '../schemas/CompanyTypeSchema.js'

async function CompanyTypeFastifyRoutes(fastify, options) {

    const controller: CompanyTypeController = new CompanyTypeController()
    const schemas = new CrudSchemaBuilder(CompanyTypeSchema, CompanyTypeBaseSchema,CompanyTypeBaseSchema, 'CompanyType', 'openapi-3.0', ['CompanyType']);

    fastify.get('/api/company-types', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/company-types/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/company-types/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/company-types/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/company-types/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/company-types/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/company-types', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/company-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/company-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/company-types/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/company-types/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/company-types/import', (req,rep) => controller.import(req,rep))
    
}

export default CompanyTypeFastifyRoutes;
export {CompanyTypeFastifyRoutes}
