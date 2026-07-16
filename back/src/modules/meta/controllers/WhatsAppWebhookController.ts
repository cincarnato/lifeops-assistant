import WhatsAppWebhookEventServiceFactory from "../factory/services/WhatsAppWebhookEventServiceFactory.js";

class WhatsAppWebhookController {

    verify(request, reply) {
        const mode = request.query?.["hub.mode"];
        const token = request.query?.["hub.verify_token"];
        const challenge = request.query?.["hub.challenge"];
        const expectedToken = process.env.META_WHATSAPP_WEBHOOK_VERIFY_TOKEN;

        if (mode === "subscribe" && expectedToken && token === expectedToken) {
            return reply.send(challenge);
        }

        reply.code(403);
        return reply.send({error: "meta.webhook.verify_failed"});
    }

    async register(request, reply) {
        try {
            const result = await WhatsAppWebhookEventServiceFactory.instance.registerWhatsAppWebhook(request.body);
            return reply.send(result);
        } catch (error: any) {
            console.error("/api/meta/whatsapp/webhook error", error);
            reply.code(400);
            return reply.send({error: error?.message ?? "meta.webhook.invalid_payload"});
        }
    }

}

export default WhatsAppWebhookController;
export {WhatsAppWebhookController};
