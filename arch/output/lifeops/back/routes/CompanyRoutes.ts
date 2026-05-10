
import CompanyController from "../controllers/CompanyController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {CompanySchema, CompanyBaseSchema} from '../schemas/CompanySchema.js'

async function CompanyFastifyRoutes(fastify, options) {

    const controller: CompanyController = new CompanyController()
    const schemas = new CrudSchemaBuilder(CompanySchema, CompanyBaseSchema,CompanyBaseSchema, 'Company', 'openapi-3.0', ['Company']);

    fastify.get('/api/companies', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/companies/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/companies/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/companies/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/companies/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/companies/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/companies', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/companies/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/companies/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/companies/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/companies/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/companies/import', (req,rep) => controller.import(req,rep))
    
}

export default CompanyFastifyRoutes;
export {CompanyFastifyRoutes}
