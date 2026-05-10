
import {AbstractMongoRepository} from "@drax/crud-back";
import {TaskTypeModel} from "../../models/TaskTypeModel.js";
import type {ITaskTypeRepository} from '../../interfaces/ITaskTypeRepository'
import type {ITaskType, ITaskTypeBase} from "../../interfaces/ITaskType";


class TaskTypeMongoRepository extends AbstractMongoRepository<ITaskType, ITaskTypeBase, ITaskTypeBase> implements ITaskTypeRepository {

    constructor() {
        super();
        this._model = TaskTypeModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = [];
        this._lean = true
    }

}

export default TaskTypeMongoRepository
export {TaskTypeMongoRepository}

