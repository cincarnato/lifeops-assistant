
import merge from "deepmerge";
import WhatsAppPhoneNumberMessages from "./WhatsAppPhoneNumber-i18n"
import WhatsAppWebhookEventMessages from "./WhatsAppWebhookEvent-i18n"

const messages = merge.all([
    WhatsAppPhoneNumberMessages,
    WhatsAppWebhookEventMessages
])

export default messages
