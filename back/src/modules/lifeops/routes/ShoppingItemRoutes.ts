
import ShoppingItemController from "../controllers/ShoppingItemController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import { z } from 'zod';
import {ShoppingItemSchema, ShoppingItemBaseSchema, ShoppingItemPurgeResultSchema} from '../schemas/ShoppingItemSchema.js'

async function ShoppingItemFastifyRoutes(fastify, options) {

    const controller: ShoppingItemController = new ShoppingItemController()
    const schemas = new CrudSchemaBuilder(ShoppingItemSchema, ShoppingItemBaseSchema,ShoppingItemBaseSchema, 'ShoppingItem', 'openapi-3.0', ['ShoppingItem']);

    fastify.get('/api/shopping-items', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/shopping-items/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))

    fastify.get('/api/shopping-items/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.get('/api/shopping-items/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))

    fastify.get('/api/shopping-items/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.get('/api/shopping-items/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/shopping-items', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/shopping-items/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.patch('/api/shopping-items/:id', {schema: schemas.updatePartialSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/shopping-items/purchased', { schema: {
        tags: ['ShoppingItem'],
        response: { 200: z.toJSONSchema(ShoppingItemPurgeResultSchema, { target: 'openapi-3.0' }) }
    } }, (req, rep) => controller.purgePurchased(req, rep));

    fastify.delete('/api/shopping-items/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))

    fastify.get('/api/shopping-items/export', (req,rep) =>controller.export(req,rep))

    fastify.post('/api/shopping-items/import', (req,rep) => controller.import(req,rep))

}

export default ShoppingItemFastifyRoutes;
export {ShoppingItemFastifyRoutes}
