
import WhatsAppWebhookEventCrudPage from "../pages/crud/WhatsAppWebhookEventCrudPage.vue";


const WhatsAppWebhookEventCrudRoute = [
  {
    name: 'WhatsAppWebhookEventCrudPage',
    path: '/crud/whatsappwebhookevent',
    component: WhatsAppWebhookEventCrudPage,
    meta: {
      auth: true,
      permission: 'whatsappwebhookevent:manage',
    }
  },
]

export default WhatsAppWebhookEventCrudRoute
export { WhatsAppWebhookEventCrudRoute }
