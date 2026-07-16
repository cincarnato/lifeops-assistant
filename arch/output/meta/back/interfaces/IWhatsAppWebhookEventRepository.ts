
import type {IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase} from './IWhatsAppWebhookEvent'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IWhatsAppWebhookEventRepository extends IDraxCrudRepository<IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase, IWhatsAppWebhookEventBase>{

}

export {IWhatsAppWebhookEventRepository}


