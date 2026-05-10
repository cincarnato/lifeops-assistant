
import type{ITaskTypeRepository} from "../interfaces/ITaskTypeRepository";
import type {ITaskTypeBase, ITaskType} from "../interfaces/ITaskType";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class TaskTypeService extends AbstractService<ITaskType, ITaskTypeBase, ITaskTypeBase> {


    constructor(TaskTypeRepository: ITaskTypeRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskTypeRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default TaskTypeService
export {TaskTypeService}
