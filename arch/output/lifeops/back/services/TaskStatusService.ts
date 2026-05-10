
import type{ITaskStatusRepository} from "../interfaces/ITaskStatusRepository";
import type {ITaskStatusBase, ITaskStatus} from "../interfaces/ITaskStatus";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class TaskStatusService extends AbstractService<ITaskStatus, ITaskStatusBase, ITaskStatusBase> {


    constructor(TaskStatusRepository: ITaskStatusRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskStatusRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default TaskStatusService
export {TaskStatusService}
