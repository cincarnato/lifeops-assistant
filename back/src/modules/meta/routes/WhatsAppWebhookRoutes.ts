import WhatsAppWebhookController from "../controllers/WhatsAppWebhookController.js";

async function WhatsAppWebhookFastifyRoutes(fastify, options) {
    const controller = new WhatsAppWebhookController();

    fastify.get("/api/meta/whatsapp/webhook", (req, rep) => controller.verify(req, rep));
    fastify.post("/api/meta/whatsapp/webhook", (req, rep) => controller.register(req, rep));
}

export default WhatsAppWebhookFastifyRoutes;
export {WhatsAppWebhookFastifyRoutes};
