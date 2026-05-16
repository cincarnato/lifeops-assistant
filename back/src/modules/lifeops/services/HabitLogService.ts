
import type{IHabitLogRepository} from "../interfaces/IHabitLogRepository";
import type {IHabitLogBase, IHabitLog} from "../interfaces/IHabitLog";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class HabitLogService extends AbstractService<IHabitLog, IHabitLogBase, IHabitLogBase> {


    constructor(HabitLogRepository: IHabitLogRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(HabitLogRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default HabitLogService
export {HabitLogService}
