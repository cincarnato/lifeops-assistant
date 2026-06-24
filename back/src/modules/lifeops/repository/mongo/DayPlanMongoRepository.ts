
import {AbstractMongoRepository} from "@drax/crud-back";
import {DayPlanModel} from "../../models/DayPlanModel.js";
import type {IDayPlanRepository} from '../../interfaces/IDayPlanRepository'
import type {IDayPlan, IDayPlanBase} from "../../interfaces/IDayPlan";


class DayPlanMongoRepository extends AbstractMongoRepository<IDayPlan, IDayPlanBase, IDayPlanBase> implements IDayPlanRepository {

    constructor() {
        super();
        this._model = DayPlanModel;
        this._searchFields = [];
        this._populateFields = ['user', 'tasks.task', 'habits.habit', 'suggestions.goal', 'suggestions.project'];
        this._lean = true
    }

}

export default DayPlanMongoRepository
export {DayPlanMongoRepository}
