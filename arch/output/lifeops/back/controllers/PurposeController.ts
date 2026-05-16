
import PurposeServiceFactory from "../factory/services/PurposeServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import PurposePermissions from "../permissions/PurposePermissions.js";
import type {IPurpose, IPurposeBase} from "../interfaces/IPurpose";

class PurposeController extends AbstractFastifyController<IPurpose, IPurposeBase, IPurposeBase>   {

    constructor() {
        super(PurposeServiceFactory.instance, PurposePermissions)
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

export default PurposeController;
export {
    PurposeController
}

