
import {AbstractMongoRepository} from "@drax/crud-back";
import {TaskScheduleModel} from "../../models/TaskScheduleModel.js";
import type {ITaskScheduleRepository} from '../../interfaces/ITaskScheduleRepository'
import type {ITaskSchedule, ITaskScheduleBase} from "../../interfaces/ITaskSchedule";


class TaskScheduleMongoRepository extends AbstractMongoRepository<ITaskSchedule, ITaskScheduleBase, ITaskScheduleBase> implements ITaskScheduleRepository {

    constructor() {
        super();
        this._model = TaskScheduleModel;
        this._searchFields = ['name'];
        this._populateFields = ['task.goals', 'task.project', 'user', 'runtime.lastTaskId'];
        this._lean = true
    }

    async findDue(now: Date, limit: number): Promise<ITaskSchedule[]> {
        return TaskScheduleModel
            .find({
                active: true,
                "runtime.nextRunAt": {$lte: now},
                $and: [
                    {$or: [{startAt: {$exists: false}}, {startAt: null}, {startAt: {$lte: now}}]},
                    {$or: [{endAt: {$exists: false}}, {endAt: null}, {endAt: {$gte: now}}]}
                ]
            })
            .sort({"runtime.nextRunAt": 1, _id: 1})
            .limit(limit)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec() as Promise<ITaskSchedule[]>
    }

}

export default TaskScheduleMongoRepository
export {TaskScheduleMongoRepository}
