
import type {IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase} from './IWhatsAppWebhookEvent'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IWhatsAppWebhookEventRepository extends IDraxCrudRepository<IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase, IWhatsAppWebhookEventBase>{
    insertMany(events: IWhatsAppWebhookEventBase[], options?: { ordered?: boolean }): Promise<IWhatsAppWebhookEvent[]>
}

export {IWhatsAppWebhookEventRepository}

