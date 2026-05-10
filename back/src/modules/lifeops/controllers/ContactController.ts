
import ContactServiceFactory from "../factory/services/ContactServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ContactPermissions from "../permissions/ContactPermissions.js";
import type {IContact, IContactBase} from "../interfaces/IContact";

class ContactController extends AbstractFastifyController<IContact, IContactBase, IContactBase>   {

    constructor() {
        super(ContactServiceFactory.instance, ContactPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

}

export default ContactController;
export {
    ContactController
}

