
import {AbstractMongoRepository} from "@drax/crud-back";
import {TaskStatusModel} from "../../models/TaskStatusModel.js";
import type {ITaskStatusRepository} from '../../interfaces/ITaskStatusRepository'
import type {ITaskStatus, ITaskStatusBase} from "../../interfaces/ITaskStatus";


class TaskStatusMongoRepository extends AbstractMongoRepository<ITaskStatus, ITaskStatusBase, ITaskStatusBase> implements ITaskStatusRepository {

    constructor() {
        super();
        this._model = TaskStatusModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = [];
        this._lean = true
    }

}

export default TaskStatusMongoRepository
export {TaskStatusMongoRepository}

