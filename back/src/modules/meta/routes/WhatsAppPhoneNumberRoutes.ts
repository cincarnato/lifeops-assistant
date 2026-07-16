
import WhatsAppPhoneNumberController from "../controllers/WhatsAppPhoneNumberController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {WhatsAppPhoneNumberSchema, WhatsAppPhoneNumberBaseSchema} from '../schemas/WhatsAppPhoneNumberSchema.js'

async function WhatsAppPhoneNumberFastifyRoutes(fastify, options) {

    const controller: WhatsAppPhoneNumberController = new WhatsAppPhoneNumberController()
    const schemas = new CrudSchemaBuilder(WhatsAppPhoneNumberSchema, WhatsAppPhoneNumberBaseSchema,WhatsAppPhoneNumberBaseSchema, 'WhatsAppPhoneNumber', 'openapi-3.0', ['WhatsAppPhoneNumber']);

    fastify.get('/api/whatsapp-phone-numbers', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))
    
    fastify.get('/api/whatsapp-phone-numbers/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))
    
    fastify.get('/api/whatsapp-phone-numbers/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))
    
    fastify.get('/api/whatsapp-phone-numbers/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))
    
    fastify.get('/api/whatsapp-phone-numbers/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))
    
    fastify.get('/api/whatsapp-phone-numbers/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/whatsapp-phone-numbers', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/whatsapp-phone-numbers/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))
    
    fastify.patch('/api/whatsapp-phone-numbers/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/whatsapp-phone-numbers/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))
    
    fastify.get('/api/whatsapp-phone-numbers/export', (req,rep) =>controller.export(req,rep))
    
    fastify.post('/api/whatsapp-phone-numbers/import', (req,rep) => controller.import(req,rep))
    
}

export default WhatsAppPhoneNumberFastifyRoutes;
export {WhatsAppPhoneNumberFastifyRoutes}
