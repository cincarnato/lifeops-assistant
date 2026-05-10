
import {AbstractMongoRepository} from "@drax/crud-back";
import {TaskPriorityModel} from "../../models/TaskPriorityModel.js";
import type {ITaskPriorityRepository} from '../../interfaces/ITaskPriorityRepository'
import type {ITaskPriority, ITaskPriorityBase} from "../../interfaces/ITaskPriority";


class TaskPriorityMongoRepository extends AbstractMongoRepository<ITaskPriority, ITaskPriorityBase, ITaskPriorityBase> implements ITaskPriorityRepository {

    constructor() {
        super();
        this._model = TaskPriorityModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = [];
        this._lean = true
    }

}

export default TaskPriorityMongoRepository
export {TaskPriorityMongoRepository}

