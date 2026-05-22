
import {AbstractMongoRepository} from "@drax/crud-back";
import {HabitModel} from "../../models/HabitModel.js";
import type {IHabitRepository} from '../../interfaces/IHabitRepository'
import type {IHabit, IHabitBase} from "../../interfaces/IHabit";


class HabitMongoRepository extends AbstractMongoRepository<IHabit, IHabitBase, IHabitBase> implements IHabitRepository {

    constructor() {
        super();
        this._model = HabitModel;
        this._searchFields = ['name', 'description', 'lifeArea'];
        this._populateFields = ['user'];
        this._lean = true
    }

}

export default HabitMongoRepository
export {HabitMongoRepository}
