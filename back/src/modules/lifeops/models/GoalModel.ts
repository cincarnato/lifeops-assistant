
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IGoal} from '../interfaces/IGoal'

const GoalSchema = new mongoose.Schema<IGoal>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            priority: {type: String, required: false, index: true, unique: false },
            valueScore: {type: Number, min: 1, max: 10, default: 5,  required: false, index: false, unique: false },
            motivationScore: {type: Number, min: 1, max: 10, default: 5,  required: false, index: false, unique: false },
            effortScore: {type: Number, min: 1, max: 10, default: 5,  required: false, index: false, unique: false },
            timeHorizon: {type: String,  enum: ['short_term', 'medium_term', 'long_term'], default: 'medium_term', required: false, index: true, unique: false },
            targetDate: {type: Date,   required: false, index: true, unique: false },
            completedAt: {type: Date,   required: false, index: false, unique: false },
            archivedAt: {type: Date,   required: false, index: false, unique: false },
            progressPercent: {type: Number, min: 0, max: 100, default: 0,  required: false, index: false, unique: false },
            successCriteria: {type: String,   required: false, index: false, unique: false },
            purpose: {type: String,   required: false, index: false, unique: false },
            constraints: [{type: String,   required: false, index: false, unique: false }],
            tags: [{type: String,   required: false, index: true, unique: false }],
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false }
}, {timestamps: true});

GoalSchema.plugin(uniqueValidator, {message: 'validation.unique'});
GoalSchema.plugin(mongoosePaginate);

GoalSchema.virtual("id").get(function () {
    return this._id.toString();
});


GoalSchema.set('toJSON', {getters: true, virtuals: true});

GoalSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Goal';
const COLLECTION_NAME = 'Goal';
const GoalModel = mongoose.model<IGoal, PaginateModel<IGoal>>(MODEL_NAME, GoalSchema,COLLECTION_NAME);

export {
    GoalSchema,
    GoalModel
}

export default GoalModel
