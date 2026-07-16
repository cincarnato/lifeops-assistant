
import WhatsAppPhoneNumberCrudRoute from "./WhatsAppPhoneNumberCrudRoute"
import WhatsAppWebhookEventCrudRoute from "./WhatsAppWebhookEventCrudRoute"

export const routes = [
    ...WhatsAppPhoneNumberCrudRoute,
    ...WhatsAppWebhookEventCrudRoute
]

export default routes
