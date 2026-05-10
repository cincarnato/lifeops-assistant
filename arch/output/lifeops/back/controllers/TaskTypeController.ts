
import TaskTypeServiceFactory from "../factory/services/TaskTypeServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TaskTypePermissions from "../permissions/TaskTypePermissions.js";
import type {ITaskType, ITaskTypeBase} from "../interfaces/ITaskType";

class TaskTypeController extends AbstractFastifyController<ITaskType, ITaskTypeBase, ITaskTypeBase>   {

    constructor() {
        super(TaskTypeServiceFactory.instance, TaskTypePermissions)
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

export default TaskTypeController;
export {
    TaskTypeController
}

