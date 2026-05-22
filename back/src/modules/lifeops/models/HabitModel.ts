
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IHabit} from '../interfaces/IHabit'

const HabitSchema = new mongoose.Schema<IHabit>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            lifeArea: {type: String,   required: false, index: true, unique: false },
            active: {type: Boolean,   required: false, index: true, unique: false },
            frequency: {
            type: {type: String,  enum: ['daily', 'weekly', 'monthly'], required: true, index: true, unique: false } 
            },
            generateTask: {type: Boolean,   required: false, index: false, unique: false },
            taskTemplate: {
            title: {type: String,   required: false, index: false, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            estimatedMinutes: {type: Number,   required: false, index: false, unique: false },
            priority: {type: String,   required: false, index: false, unique: false } 
            },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: false}
}, {timestamps: true});

HabitSchema.plugin(uniqueValidator, {message: 'validation.unique'});
HabitSchema.plugin(mongoosePaginate);

HabitSchema.virtual("id").get(function () {
    return this._id.toString();
});


HabitSchema.set('toJSON', {getters: true, virtuals: true});

HabitSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Habit';
const COLLECTION_NAME = 'Habit';
const HabitModel = mongoose.model<IHabit, PaginateModel<IHabit>>(MODEL_NAME, HabitSchema,COLLECTION_NAME);

export {
    HabitSchema,
    HabitModel
}

export default HabitModel
