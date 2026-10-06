
import TaskScheduleServiceFactory from "../factory/services/TaskScheduleServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TaskSchedulePermissions from "../permissions/TaskSchedulePermissions.js";
import type {ITaskSchedule, ITaskScheduleBase} from "../interfaces/ITaskSchedule";

class TaskScheduleController extends AbstractFastifyController<ITaskSchedule, ITaskScheduleBase, ITaskScheduleBase>   {

    constructor() {
        super(TaskScheduleServiceFactory.instance, TaskSchedulePermissions)
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

export default TaskScheduleController;
export {
    TaskScheduleController
}

