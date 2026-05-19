
import type{IHabitRepository} from "../interfaces/IHabitRepository";
import type {IHabitBase, IHabit} from "../interfaces/IHabit";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class HabitService extends AbstractService<IHabit, IHabitBase, IHabitBase> {


    constructor(HabitRepository: IHabitRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(HabitRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.transformCreate = this.normalizeCreateData.bind(this)
        
    }

    private async normalizeCreateData(data: IHabitBase): Promise<IHabitBase> {
        return {
            ...data,
            name: this.capitalizeFirstLetter(data.name)
        }
    }

    private capitalizeFirstLetter(value: string): string {
        if (!value) return value
        return value.charAt(0).toLocaleUpperCase('es') + value.slice(1)
    }

}

export default HabitService
export {HabitService}
