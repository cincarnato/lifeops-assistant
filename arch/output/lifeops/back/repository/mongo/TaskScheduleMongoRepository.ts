
import {AbstractMongoRepository} from "@drax/crud-back";
import {TaskScheduleModel} from "../../models/TaskScheduleModel.js";
import type {ITaskScheduleRepository} from '../../interfaces/ITaskScheduleRepository'
import type {ITaskSchedule, ITaskScheduleBase} from "../../interfaces/ITaskSchedule";


class TaskScheduleMongoRepository extends AbstractMongoRepository<ITaskSchedule, ITaskScheduleBase, ITaskScheduleBase> implements ITaskScheduleRepository {

    constructor() {
        super();
        this._model = TaskScheduleModel;
        this._searchFields = ['name'];
        this._populateFields = ['user'];
        this._lean = true
    }

}

export default TaskScheduleMongoRepository
export {TaskScheduleMongoRepository}

