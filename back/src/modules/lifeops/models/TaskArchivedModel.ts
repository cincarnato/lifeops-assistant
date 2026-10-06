import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import type {ITaskArchived} from '../interfaces/ITask'
import {buildTaskSchema} from "./TaskModel.js";

const TaskArchivedSchema = buildTaskSchema<ITaskArchived>({
    migratedAt: {type: Date, required: true, index: true},
    schemaVersion: {type: Number, required: true, default: 1}
}, {
    archiveLookupIndex: false
});

TaskArchivedSchema.index({user: 1, migratedAt: -1});

const MODEL_NAME = 'TaskArchived';
const COLLECTION_NAME = 'TaskArchived';
const TaskArchivedModel = mongoose.model<ITaskArchived, PaginateModel<ITaskArchived>>(
    MODEL_NAME,
    TaskArchivedSchema,
    COLLECTION_NAME
);

export {
    TaskArchivedSchema,
    TaskArchivedModel
}

export default TaskArchivedModel
