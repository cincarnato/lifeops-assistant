
import WhatsAppPhoneNumberServiceFactory from "../factory/services/WhatsAppPhoneNumberServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import WhatsAppPhoneNumberPermissions from "../permissions/WhatsAppPhoneNumberPermissions.js";
import type {IWhatsAppPhoneNumber, IWhatsAppPhoneNumberBase} from "../interfaces/IWhatsAppPhoneNumber";

class WhatsAppPhoneNumberController extends AbstractFastifyController<IWhatsAppPhoneNumber, IWhatsAppPhoneNumberBase, IWhatsAppPhoneNumberBase>   {

    constructor() {
        super(WhatsAppPhoneNumberServiceFactory.instance, WhatsAppPhoneNumberPermissions)
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

export default WhatsAppPhoneNumberController;
export {
    WhatsAppPhoneNumberController
}

