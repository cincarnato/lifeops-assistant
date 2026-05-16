
import type{IHabitRepository} from "../interfaces/IHabitRepository";
import type {IHabitBase, IHabit} from "../interfaces/IHabit";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class HabitService extends AbstractService<IHabit, IHabitBase, IHabitBase> {


    constructor(HabitRepository: IHabitRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(HabitRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default HabitService
export {HabitService}
