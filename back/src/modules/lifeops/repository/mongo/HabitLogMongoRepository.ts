
import {AbstractMongoRepository} from "@drax/crud-back";
import {HabitLogModel} from "../../models/HabitLogModel.js";
import type {IHabitLogRepository} from '../../interfaces/IHabitLogRepository'
import type {IHabitLog, IHabitLogBase} from "../../interfaces/IHabitLog";


class HabitLogMongoRepository extends AbstractMongoRepository<IHabitLog, IHabitLogBase, IHabitLogBase> implements IHabitLogRepository {

    constructor() {
        super();
        this._model = HabitLogModel;
        this._searchFields = [];
        this._populateFields = ['habit', 'task'];
        this._lean = true
    }

}

export default HabitLogMongoRepository
export {HabitLogMongoRepository}

