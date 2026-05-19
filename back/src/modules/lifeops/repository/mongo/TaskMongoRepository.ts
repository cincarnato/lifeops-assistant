
import {AbstractMongoRepository} from "@drax/crud-back";
import {TaskModel} from "../../models/TaskModel.js";
import type {ITaskRepository} from '../../interfaces/ITaskRepository'
import type {ITask, ITaskBase} from "../../interfaces/ITask";


class TaskMongoRepository extends AbstractMongoRepository<ITask, ITaskBase, ITaskBase> implements ITaskRepository {

    constructor() {
        super();
        this._model = TaskModel;
        this._searchFields = ['title', 'description'];
        this._populateFields = ['goals', 'project', 'user'];
        this._lean = true
    }

}

export default TaskMongoRepository
export {TaskMongoRepository}
