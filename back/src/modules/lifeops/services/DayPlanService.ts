
import type{IDayPlanRepository} from "../interfaces/IDayPlanRepository";
import type {IDayPlanBase, IDayPlan} from "../interfaces/IDayPlan";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class DayPlanService extends AbstractService<IDayPlan, IDayPlanBase, IDayPlanBase> {


    constructor(DayPlanRepository: IDayPlanRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(DayPlanRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.transformRead = this.normalizeRead.bind(this)
        
    }

    private async normalizeRead(dayPlan: IDayPlan): Promise<IDayPlan> {
        const normalized = typeof (dayPlan as any).toObject === 'function'
            ? (dayPlan as any).toObject({virtuals: true})
            : {...dayPlan}

        if (Array.isArray(normalized.tasks)) {
            normalized.tasks = normalized.tasks.filter(({task}) => task != null)
        }

        if (Array.isArray(normalized.habits)) {
            normalized.habits = normalized.habits.filter(({habit}) => habit != null)
        }

        return normalized
    }

}

export default DayPlanService
export {DayPlanService}
