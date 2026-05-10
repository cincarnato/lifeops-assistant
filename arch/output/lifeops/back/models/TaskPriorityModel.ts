
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITaskPriority} from '../interfaces/ITaskPriority'

const TaskPrioritySchema = new mongoose.Schema<ITaskPriority>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

TaskPrioritySchema.plugin(uniqueValidator, {message: 'validation.unique'});
TaskPrioritySchema.plugin(mongoosePaginate);

TaskPrioritySchema.virtual("id").get(function () {
    return this._id.toString();
});


TaskPrioritySchema.set('toJSON', {getters: true, virtuals: true});

TaskPrioritySchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'TaskPriority';
const COLLECTION_NAME = 'TaskPriority';
const TaskPriorityModel = mongoose.model<ITaskPriority, PaginateModel<ITaskPriority>>(MODEL_NAME, TaskPrioritySchema,COLLECTION_NAME);

export {
    TaskPrioritySchema,
    TaskPriorityModel
}

export default TaskPriorityModel
