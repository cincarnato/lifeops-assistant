
import {AbstractMongoRepository} from "@drax/crud-back";
import {mongoose, MongooseQueryFilter, MongooseSort} from "@drax/common-back";
import type {PaginateOptions, PaginateResult} from "mongoose";
import type {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import {TaskModel} from "../../models/TaskModel.js";
import {TaskArchivedModel} from "../../models/TaskArchivedModel.js";
import type {ITaskRepository} from '../../interfaces/ITaskRepository'
import type {ITask, ITaskBase} from "../../interfaces/ITask";


class TaskMongoRepository extends AbstractMongoRepository<ITask, ITaskBase, ITaskBase> implements ITaskRepository {

    constructor() {
        super();
        this._model = TaskModel;
        this._searchFields = ['title', 'description', 'redmineIssueId', 'emailMessageId', 'calendarEventId'];
        this._populateFields = ['goals', 'project', 'user'];
        this._lean = true
    }

    async findById(id: string): Promise<ITask | null> {
        const task = await super.findById(id)

        if (task) {
            return task
        }

        return this.findArchivedById(id)
    }

    async findArchivedById(id: string): Promise<ITask | null> {
        this.assertId(id)

        const item = await TaskArchivedModel
            .findById(id)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec()

        return item as ITask | null
    }

    async paginateArchived(options: IDraxPaginateOptions): Promise<IDraxPaginateResult<ITask>> {
        return this.paginateModel(TaskArchivedModel as any, options)
    }

    async findPendingArchiveBatch(cutoff: Date, limit: number): Promise<ITask[]> {
        return TaskModel
            .find({archivedAt: {$lte: cutoff}})
            .sort({archivedAt: 1, _id: 1})
            .limit(limit)
            .lean(true)
            .exec() as Promise<ITask[]>
    }

    async archiveTask(task: ITask, migratedAt: Date = new Date()): Promise<void> {
        const taskData = this.toPlainTaskData(task)

        await TaskArchivedModel.updateOne(
            {_id: taskData._id},
            {
                $setOnInsert: {
                    ...taskData,
                    migratedAt,
                    schemaVersion: 1
                }
            },
            {upsert: true, timestamps: false}
        ).exec()

        await TaskModel.deleteOne({
            _id: taskData._id,
            archivedAt: taskData.archivedAt
        }).exec()
    }

    private async paginateModel(model: any, {
        page = 1,
        limit = 5,
        orderBy = '',
        order = "asc",
        search = '',
        filters = []
    }: IDraxPaginateOptions): Promise<IDraxPaginateResult<ITask>> {
        const query = {}

        if (search) {
            if (mongoose.Types.ObjectId.isValid(search)) {
                query['_id'] = new mongoose.Types.ObjectId(search)
            } else {
                query['$or'] = this._searchFields.map(field => ({[field]: new RegExp(this.escapeRegExp(search), 'i')}))
            }
        }

        MongooseQueryFilter.applyFilters(query, filters, model)

        const sort = MongooseSort.applySort(orderBy, order)
        const options = {page, limit, sort, populate: this._populateFields, lean: this._lean} as PaginateOptions
        const items: PaginateResult<ITask> = await model.paginate(query, options)

        return {
            page,
            limit,
            total: items.totalDocs,
            items: items.docs
        }
    }

    private toPlainTaskData(task: ITask): ITask {
        const source = typeof (task as any).toObject === 'function'
            ? (task as any).toObject({virtuals: false})
            : {...task}

        delete source.id

        return source
    }

}

export default TaskMongoRepository
export {TaskMongoRepository}
