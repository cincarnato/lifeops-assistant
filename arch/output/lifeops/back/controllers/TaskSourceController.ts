
import TaskSourceServiceFactory from "../factory/services/TaskSourceServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TaskSourcePermissions from "../permissions/TaskSourcePermissions.js";
import type {ITaskSource, ITaskSourceBase} from "../interfaces/ITaskSource";

class TaskSourceController extends AbstractFastifyController<ITaskSource, ITaskSourceBase, ITaskSourceBase>   {

    constructor() {
        super(TaskSourceServiceFactory.instance, TaskSourcePermissions)
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

export default TaskSourceController;
export {
    TaskSourceController
}

