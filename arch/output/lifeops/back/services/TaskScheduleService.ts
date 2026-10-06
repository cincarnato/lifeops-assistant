
import type{ITaskScheduleRepository} from "../interfaces/ITaskScheduleRepository";
import type {ITaskScheduleBase, ITaskSchedule} from "../interfaces/ITaskSchedule";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class TaskScheduleService extends AbstractService<ITaskSchedule, ITaskScheduleBase, ITaskScheduleBase> {


    constructor(TaskScheduleRepository: ITaskScheduleRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskScheduleRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default TaskScheduleService
export {TaskScheduleService}
