
import TaskServiceFactory from "../factory/services/TaskServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TaskPermissions from "../permissions/TaskPermissions.js";
import type {ITask, ITaskBase} from "../interfaces/ITask";

class TaskController extends AbstractFastifyController<ITask, ITaskBase, ITaskBase>   {

    constructor() {
        super(TaskServiceFactory.instance, TaskPermissions)
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

export default TaskController;
export {
    TaskController
}

