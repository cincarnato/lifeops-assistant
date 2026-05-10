
import ContactTypeServiceFactory from "../factory/services/ContactTypeServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ContactTypePermissions from "../permissions/ContactTypePermissions.js";
import type {IContactType, IContactTypeBase} from "../interfaces/IContactType";

class ContactTypeController extends AbstractFastifyController<IContactType, IContactTypeBase, IContactTypeBase>   {

    constructor() {
        super(ContactTypeServiceFactory.instance, ContactTypePermissions)
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

export default ContactTypeController;
export {
    ContactTypeController
}

