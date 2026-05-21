
import ContactController from "../controllers/ContactController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {ContactSchema, ContactBaseSchema} from '../schemas/ContactSchema.js'

async function ContactFastifyRoutes(fastify, options) {

    const controller: ContactController = new ContactController()
    const schemas = new CrudSchemaBuilder(ContactSchema, ContactBaseSchema,ContactBaseSchema, 'Contact', 'openapi-3.0', ['Contact']);

    fastify.get('/api/contacts', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/contacts/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/contacts/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.post('/api/contacts/:id/sync-google', {
        schema: {
            tags: ['Contact'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {type: 'string'},
                },
            },
        },
    }, (req, rep) => controller.syncGoogle(req as any, rep))
    
    fastify.get('/api/contacts/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/contacts/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/contacts/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/contacts', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/contacts/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/contacts/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/contacts/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/contacts/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/contacts/import', (req,rep) => controller.import(req,rep))
    
}

export default ContactFastifyRoutes;
export {ContactFastifyRoutes}
