
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITaskSource} from '../interfaces/ITaskSource'

const TaskSourceSchema = new mongoose.Schema<ITaskSource>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

TaskSourceSchema.plugin(uniqueValidator, {message: 'validation.unique'});
TaskSourceSchema.plugin(mongoosePaginate);

TaskSourceSchema.virtual("id").get(function () {
    return this._id.toString();
});


TaskSourceSchema.set('toJSON', {getters: true, virtuals: true});

TaskSourceSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'TaskSource';
const COLLECTION_NAME = 'TaskSource';
const TaskSourceModel = mongoose.model<ITaskSource, PaginateModel<ITaskSource>>(MODEL_NAME, TaskSourceSchema,COLLECTION_NAME);

export {
    TaskSourceSchema,
    TaskSourceModel
}

export default TaskSourceModel
