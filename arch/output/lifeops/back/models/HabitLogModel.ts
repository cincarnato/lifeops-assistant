
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IHabitLog} from '../interfaces/IHabitLog'

const HabitLogSchema = new mongoose.Schema<IHabitLog>({
            habit: {type: mongoose.Schema.Types.ObjectId, ref: 'Habit',  required: true, index: true, unique: false },
            date: {type: Date,   required: true, index: true, unique: false },
            task: {type: mongoose.Schema.Types.ObjectId, ref: 'Task',  required: false, index: true, unique: false }
}, {timestamps: true});

HabitLogSchema.plugin(uniqueValidator, {message: 'validation.unique'});
HabitLogSchema.plugin(mongoosePaginate);

HabitLogSchema.virtual("id").get(function () {
    return this._id.toString();
});


HabitLogSchema.set('toJSON', {getters: true, virtuals: true});

HabitLogSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'HabitLog';
const COLLECTION_NAME = 'HabitLog';
const HabitLogModel = mongoose.model<IHabitLog, PaginateModel<IHabitLog>>(MODEL_NAME, HabitLogSchema,COLLECTION_NAME);

export {
    HabitLogSchema,
    HabitLogModel
}

export default HabitLogModel
