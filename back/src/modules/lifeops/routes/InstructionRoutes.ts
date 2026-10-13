
import InstructionController from "../controllers/InstructionController.js";
import {CrudSchemaBuilder} from "@drax/crud-back";
import {InstructionSchema, InstructionBaseSchema} from '../schemas/InstructionSchema.js'

async function InstructionFastifyRoutes(fastify, options) {

    const controller: InstructionController = new InstructionController()
    const schemas = new CrudSchemaBuilder(InstructionSchema, InstructionBaseSchema,InstructionBaseSchema, 'Instruction', 'openapi-3.0', ['Instruction']);

    fastify.get('/api/instructions', {schema: schemas.paginateSchema}, (req,rep) => controller.paginate(req,rep))

    fastify.get('/api/instructions/find', {schema: schemas.findSchema}, (req,rep) => controller.find(req,rep))

    fastify.get('/api/instructions/search', {schema: schemas.searchSchema}, (req,rep) => controller.search(req,rep))

    fastify.get('/api/instructions/:id', {schema: schemas.findByIdSchema}, (req,rep) => controller.findById(req,rep))

    fastify.get('/api/instructions/find-one', {schema: schemas.findOneSchema}, (req,rep) => controller.findOne(req,rep))

    fastify.get('/api/instructions/group-by', {schema: schemas.groupBySchema}, (req,rep) => controller.groupBy(req,rep))

    fastify.post('/api/instructions', {schema: schemas.createSchema}, (req,rep) =>controller.create(req,rep))

    fastify.put('/api/instructions/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.update(req,rep))

    fastify.patch('/api/instructions/:id', {schema: schemas.updateSchema}, (req,rep) =>controller.updatePartial(req,rep))

    fastify.delete('/api/instructions/:id', {schema: schemas.deleteSchema}, (req,rep) =>controller.delete(req,rep))

    fastify.get('/api/instructions/export', (req,rep) =>controller.export(req,rep))

    fastify.post('/api/instructions/import', (req,rep) => controller.import(req,rep))

}

export default InstructionFastifyRoutes;
export {InstructionFastifyRoutes}
