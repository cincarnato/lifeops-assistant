
import type{IWhatsAppWebhookEventRepository} from "../interfaces/IWhatsAppWebhookEventRepository";
import type {IWhatsAppWebhookEventBase, IWhatsAppWebhookEvent} from "../interfaces/IWhatsAppWebhookEvent";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class WhatsAppWebhookEventService extends AbstractService<IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase, IWhatsAppWebhookEventBase> {


    constructor(WhatsAppWebhookEventRepository: IWhatsAppWebhookEventRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(WhatsAppWebhookEventRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default WhatsAppWebhookEventService
export {WhatsAppWebhookEventService}
