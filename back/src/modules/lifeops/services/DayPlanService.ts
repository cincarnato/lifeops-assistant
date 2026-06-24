
import type{IDayPlanRepository} from "../interfaces/IDayPlanRepository";
import type {IDayPlanBase, IDayPlan} from "../interfaces/IDayPlan";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class DayPlanService extends AbstractService<IDayPlan, IDayPlanBase, IDayPlanBase> {


    constructor(DayPlanRepository: IDayPlanRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(DayPlanRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default DayPlanService
export {DayPlanService}
