
import TaskPriorityServiceFactory from "../factory/services/TaskPriorityServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TaskPriorityPermissions from "../permissions/TaskPriorityPermissions.js";
import type {ITaskPriority, ITaskPriorityBase} from "../interfaces/ITaskPriority";

class TaskPriorityController extends AbstractFastifyController<ITaskPriority, ITaskPriorityBase, ITaskPriorityBase>   {

    constructor() {
        super(TaskPriorityServiceFactory.instance, TaskPriorityPermissions)
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

export default TaskPriorityController;
export {
    TaskPriorityController
}

