
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITaskType} from '../interfaces/ITaskType'

const TaskTypeSchema = new mongoose.Schema<ITaskType>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

TaskTypeSchema.plugin(uniqueValidator, {message: 'validation.unique'});
TaskTypeSchema.plugin(mongoosePaginate);

TaskTypeSchema.virtual("id").get(function () {
    return this._id.toString();
});


TaskTypeSchema.set('toJSON', {getters: true, virtuals: true});

TaskTypeSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'TaskType';
const COLLECTION_NAME = 'TaskType';
const TaskTypeModel = mongoose.model<ITaskType, PaginateModel<ITaskType>>(MODEL_NAME, TaskTypeSchema,COLLECTION_NAME);

export {
    TaskTypeSchema,
    TaskTypeModel
}

export default TaskTypeModel
