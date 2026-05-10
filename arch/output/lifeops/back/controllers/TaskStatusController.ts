
import TaskStatusServiceFactory from "../factory/services/TaskStatusServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TaskStatusPermissions from "../permissions/TaskStatusPermissions.js";
import type {ITaskStatus, ITaskStatusBase} from "../interfaces/ITaskStatus";

class TaskStatusController extends AbstractFastifyController<ITaskStatus, ITaskStatusBase, ITaskStatusBase>   {

    constructor() {
        super(TaskStatusServiceFactory.instance, TaskStatusPermissions)
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

export default TaskStatusController;
export {
    TaskStatusController
}

