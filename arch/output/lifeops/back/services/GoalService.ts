
import type{IGoalRepository} from "../interfaces/IGoalRepository";
import type {IGoalBase, IGoal} from "../interfaces/IGoal";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class GoalService extends AbstractService<IGoal, IGoalBase, IGoalBase> {


    constructor(GoalRepository: IGoalRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(GoalRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default GoalService
export {GoalService}
