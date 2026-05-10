
import type{ITaskRepository} from "../interfaces/ITaskRepository";
import type {ITaskBase, ITask} from "../interfaces/ITask";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class TaskService extends AbstractService<ITask, ITaskBase, ITaskBase> {


    constructor(TaskRepository: ITaskRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default TaskService
export {TaskService}
