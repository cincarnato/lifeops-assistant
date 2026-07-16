
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase} from '../interfaces/IWhatsAppWebhookEvent'

class WhatsAppWebhookEventProvider extends AbstractCrudRestProvider<IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase, IWhatsAppWebhookEventBase> {
    
  static singleton: WhatsAppWebhookEventProvider
    
  constructor() {
   super('/api/whatsapp-webhook-events')
  }
  
  static get instance() {
    if(!WhatsAppWebhookEventProvider.singleton){
      WhatsAppWebhookEventProvider.singleton = new WhatsAppWebhookEventProvider()
    }
    return WhatsAppWebhookEventProvider.singleton
  }

}

export default WhatsAppWebhookEventProvider

