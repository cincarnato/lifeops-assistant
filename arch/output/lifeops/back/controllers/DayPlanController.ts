
import DayPlanServiceFactory from "../factory/services/DayPlanServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import DayPlanPermissions from "../permissions/DayPlanPermissions.js";
import type {IDayPlan, IDayPlanBase} from "../interfaces/IDayPlan";

class DayPlanController extends AbstractFastifyController<IDayPlan, IDayPlanBase, IDayPlanBase>   {

    constructor() {
        super(DayPlanServiceFactory.instance, DayPlanPermissions)
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

export default DayPlanController;
export {
    DayPlanController
}

