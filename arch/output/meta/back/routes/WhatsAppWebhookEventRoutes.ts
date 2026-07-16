
import WhatsAppWebhookEventController from "../controllers/WhatsAppWebhookEventController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {WhatsAppWebhookEventSchema, WhatsAppWebhookEventBaseSchema} from '../schemas/WhatsAppWebhookEventSchema.js'

async function WhatsAppWebhookEventFastifyRoutes(fastify, options) {

    const controller: WhatsAppWebhookEventController = new WhatsAppWebhookEventController()
    const schemas = new CrudSchemaBuilder(WhatsAppWebhookEventSchema, WhatsAppWebhookEventBaseSchema,WhatsAppWebhookEventBaseSchema, 'WhatsAppWebhookEvent', 'openapi-3.0', ['WhatsAppWebhookEvent']);

    fastify.get('/api/whatsapp-webhook-events', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/whatsapp-webhook-events/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/whatsapp-webhook-events/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/whatsapp-webhook-events/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/whatsapp-webhook-events/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/whatsapp-webhook-events/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/whatsapp-webhook-events', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/whatsapp-webhook-events/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/whatsapp-webhook-events/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/whatsapp-webhook-events/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/whatsapp-webhook-events/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/whatsapp-webhook-events/import', (req,rep) => controller.import(req,rep))
    
}

export default WhatsAppWebhookEventFastifyRoutes;
export {WhatsAppWebhookEventFastifyRoutes}
