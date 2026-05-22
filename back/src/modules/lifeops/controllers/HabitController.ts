
import HabitServiceFactory from "../factory/services/HabitServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import HabitPermissions from "../permissions/HabitPermissions.js";
import type {IHabit, IHabitBase} from "../interfaces/IHabit";

class HabitController extends AbstractFastifyController<IHabit, IHabitBase, IHabitBase>   {

    constructor() {
        super(HabitServiceFactory.instance, HabitPermissions)
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

export default HabitController;
export {
    HabitController
}
