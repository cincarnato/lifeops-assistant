
import HabitLogServiceFactory from "../factory/services/HabitLogServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import HabitLogPermissions from "../permissions/HabitLogPermissions.js";
import type {IHabitLog, IHabitLogBase} from "../interfaces/IHabitLog";

class HabitLogController extends AbstractFastifyController<IHabitLog, IHabitLogBase, IHabitLogBase>   {

    constructor() {
        super(HabitLogServiceFactory.instance, HabitLogPermissions)
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

export default HabitLogController;
export {
    HabitLogController
}

