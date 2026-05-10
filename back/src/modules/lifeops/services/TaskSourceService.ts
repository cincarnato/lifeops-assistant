
import type{ITaskSourceRepository} from "../interfaces/ITaskSourceRepository";
import type {ITaskSourceBase, ITaskSource} from "../interfaces/ITaskSource";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class TaskSourceService extends AbstractService<ITaskSource, ITaskSourceBase, ITaskSourceBase> {


    constructor(TaskSourceRepository: ITaskSourceRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskSourceRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default TaskSourceService
export {TaskSourceService}
