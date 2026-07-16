
import WhatsAppWebhookEventServiceFactory from "../factory/services/WhatsAppWebhookEventServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import WhatsAppWebhookEventPermissions from "../permissions/WhatsAppWebhookEventPermissions.js";
import type {IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase} from "../interfaces/IWhatsAppWebhookEvent";

class WhatsAppWebhookEventController extends AbstractFastifyController<IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase, IWhatsAppWebhookEventBase>   {

    constructor() {
        super(WhatsAppWebhookEventServiceFactory.instance, WhatsAppWebhookEventPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

}

export default WhatsAppWebhookEventController;
export {
    WhatsAppWebhookEventController
}

