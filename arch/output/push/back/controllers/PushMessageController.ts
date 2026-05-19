
import PushMessageServiceFactory from "../factory/services/PushMessageServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import PushMessagePermissions from "../permissions/PushMessagePermissions.js";
import type {IPushMessage, IPushMessageBase} from "../interfaces/IPushMessage";

class PushMessageController extends AbstractFastifyController<IPushMessage, IPushMessageBase, IPushMessageBase>   {

    constructor() {
        super(PushMessageServiceFactory.instance, PushMessagePermissions)
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

export default PushMessageController;
export {
    PushMessageController
}

