
import type{ITaskPriorityRepository} from "../interfaces/ITaskPriorityRepository";
import type {ITaskPriorityBase, ITaskPriority} from "../interfaces/ITaskPriority";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class TaskPriorityService extends AbstractService<ITaskPriority, ITaskPriorityBase, ITaskPriorityBase> {


    constructor(TaskPriorityRepository: ITaskPriorityRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskPriorityRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default TaskPriorityService
export {TaskPriorityService}
