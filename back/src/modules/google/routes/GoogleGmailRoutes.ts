import GoogleGmailController from "../controllers/GoogleGmailController.js";

async function GoogleGmailFastifyRoutes(fastify, options) {

    const controller: GoogleGmailController = new GoogleGmailController();

    fastify.get('/api/google/gmail/messages', (req, rep) => controller.list(req, rep));

    fastify.get('/api/google/gmail/messages/:id', (req, rep) => controller.get(req, rep));
}

export default GoogleGmailFastifyRoutes;
export {GoogleGmailFastifyRoutes};
