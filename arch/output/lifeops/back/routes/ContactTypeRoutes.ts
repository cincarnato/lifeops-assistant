
import ContactTypeController from "../controllers/ContactTypeController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {ContactTypeSchema, ContactTypeBaseSchema} from '../schemas/ContactTypeSchema.js'

async function ContactTypeFastifyRoutes(fastify, options) {

    const controller: ContactTypeController = new ContactTypeController()
    const schemas = new CrudSchemaBuilder(ContactTypeSchema, ContactTypeBaseSchema,ContactTypeBaseSchema, 'ContactType', 'openapi-3.0', ['ContactType']);

    fastify.get('/api/contact-types', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/contact-types/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/contact-types/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/contact-types/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/contact-types/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/contact-types/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/contact-types', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/contact-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/contact-types/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/contact-types/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/contact-types/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/contact-types/import', (req,rep) => controller.import(req,rep))
    
}

export default ContactTypeFastifyRoutes;
export {ContactTypeFastifyRoutes}
