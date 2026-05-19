import GoogleContactsController from "../controllers/GoogleContactsController.js";

async function GoogleContactsFastifyRoutes(fastify, options) {

    const controller: GoogleContactsController = new GoogleContactsController();

    fastify.get('/api/google/contacts', (req, rep) => controller.list(req, rep));

    fastify.post('/api/google/contacts', (req, rep) => controller.create(req, rep));

    fastify.post('/api/google/contacts/sync', (req, rep) => controller.sync(req, rep));
}

export default GoogleContactsFastifyRoutes;
export {GoogleContactsFastifyRoutes};
