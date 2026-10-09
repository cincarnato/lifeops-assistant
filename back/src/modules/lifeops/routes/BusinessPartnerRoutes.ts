
import BusinessPartnerController from "../controllers/BusinessPartnerController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {BusinessPartnerSchema, BusinessPartnerBaseSchema} from '../schemas/BusinessPartnerSchema.js'

async function BusinessPartnerFastifyRoutes(fastify, options) {

    const controller: BusinessPartnerController = new BusinessPartnerController()
    const schemas = new CrudSchemaBuilder(BusinessPartnerSchema, BusinessPartnerBaseSchema,BusinessPartnerBaseSchema, 'BusinessPartner', 'openapi-3.0', ['BusinessPartner']);

    fastify.get('/api/business-partners', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/business-partners/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))

    fastify.get('/api/business-partners/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.get('/api/business-partners/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))

    fastify.get('/api/business-partners/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.get('/api/business-partners/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/business-partners', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/business-partners/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.patch('/api/business-partners/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/business-partners/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))

    fastify.get('/api/business-partners/export', (req,rep) =>controller.export(req,rep))

    fastify.post('/api/business-partners/import', (req,rep) => controller.import(req,rep))

}

export default BusinessPartnerFastifyRoutes;
export {BusinessPartnerFastifyRoutes}
