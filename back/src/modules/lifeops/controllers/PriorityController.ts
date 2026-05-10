
import PriorityServiceFactory from "../factory/services/PriorityServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import PriorityPermissions from "../permissions/PriorityPermissions.js";
import type {IPriority, IPriorityBase} from "../interfaces/IPriority";

class PriorityController extends AbstractFastifyController<IPriority, IPriorityBase, IPriorityBase>   {

    constructor() {
        super(PriorityServiceFactory.instance, PriorityPermissions)
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

export default PriorityController;
export {
    PriorityController
}

