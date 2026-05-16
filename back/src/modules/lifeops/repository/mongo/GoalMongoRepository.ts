
import {AbstractMongoRepository} from "@drax/crud-back";
import {GoalModel} from "../../models/GoalModel.js";
import type {IGoalRepository} from '../../interfaces/IGoalRepository'
import type {IGoal, IGoalBase} from "../../interfaces/IGoal";


class GoalMongoRepository extends AbstractMongoRepository<IGoal, IGoalBase, IGoalBase> implements IGoalRepository {

    constructor() {
        super();
        this._model = GoalModel;
        this._searchFields = ['name', 'description', 'lifeArea'];
        this._populateFields = ['user'];
        this._lean = true
    }

}

export default GoalMongoRepository
export {GoalMongoRepository}
