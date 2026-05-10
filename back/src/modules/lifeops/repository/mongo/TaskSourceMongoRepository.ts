
import {AbstractMongoRepository} from "@drax/crud-back";
import {TaskSourceModel} from "../../models/TaskSourceModel.js";
import type {ITaskSourceRepository} from '../../interfaces/ITaskSourceRepository'
import type {ITaskSource, ITaskSourceBase} from "../../interfaces/ITaskSource";


class TaskSourceMongoRepository extends AbstractMongoRepository<ITaskSource, ITaskSourceBase, ITaskSourceBase> implements ITaskSourceRepository {

    constructor() {
        super();
        this._model = TaskSourceModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = [];
        this._lean = true
    }

}

export default TaskSourceMongoRepository
export {TaskSourceMongoRepository}

