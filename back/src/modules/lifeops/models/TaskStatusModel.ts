
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITaskStatus} from '../interfaces/ITaskStatus'

const TaskStatusSchema = new mongoose.Schema<ITaskStatus>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            color: {type: String,   required: false, index: false, unique: false, default: "#64748b" },
            completesTask: {type: Boolean, required: false, index: false, unique: false, default: false },
            archivesTask: {type: Boolean, required: false, index: false, unique: false, default: false }
}, {timestamps: true});

TaskStatusSchema.plugin(uniqueValidator, {message: 'validation.unique'});
TaskStatusSchema.plugin(mongoosePaginate);

TaskStatusSchema.virtual("id").get(function () {
    return this._id.toString();
});


TaskStatusSchema.set('toJSON', {getters: true, virtuals: true});

TaskStatusSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'TaskStatus';
const COLLECTION_NAME = 'TaskStatus';
const TaskStatusModel = mongoose.model<ITaskStatus, PaginateModel<ITaskStatus>>(MODEL_NAME, TaskStatusSchema,COLLECTION_NAME);

export {
    TaskStatusSchema,
    TaskStatusModel
}

export default TaskStatusModel
