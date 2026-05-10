
import GoalServiceFactory from "../factory/services/GoalServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import GoalPermissions from "../permissions/GoalPermissions.js";
import type {IGoal, IGoalBase} from "../interfaces/IGoal";

class GoalController extends AbstractFastifyController<IGoal, IGoalBase, IGoalBase>   {

    constructor() {
        super(GoalServiceFactory.instance, GoalPermissions)
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

export default GoalController;
export {
    GoalController
}

