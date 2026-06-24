import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IDayPlan} from '../interfaces/IDayPlan'

const DayPlanSchema = new mongoose.Schema<IDayPlan>({
    date: {type: Date, required: true, index: true, unique: false},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: false},
    status: {
        type: String,
        enum: ['BORRADOR', 'VISTO', 'CONFIRMADO', 'CERRADO'],
        required: true,
        index: true,
        unique: false
    },
    events: [{
        googleEventId: {type: String, required: true, index: true, unique: false},
        title: {type: String, required: true, index: false, unique: false},
        description: {type: String, required: false, index: false, unique: false},
        startAt: {type: Date, required: true, index: true, unique: false},
        endAt: {type: Date, required: false, index: false, unique: false},
        decision: {
            type: String,
            enum: ['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO'],
            required: false,
            index: false,
            unique: false
        }
    }],
    tasks: [{
        task: {type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true, unique: false},
        decision: {
            type: String,
            enum: ['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO'],
            required: false,
            index: false,
            unique: false
        }
    }],
    habits: [{
        habit: {type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true, index: true, unique: false},
        decision: {
            type: String,
            enum: ['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO'],
            required: false,
            index: false,
            unique: false
        }
    }],
    suggestions: [{
        title: {type: String, required: true, index: false, unique: false},
        decision: {
            type: String,
            enum: ['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO'],
            required: false,
            index: false,
            unique: false
        },
        goal: {type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: false, index: true, unique: false},
        project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false, index: true, unique: false}
    }]
}, {timestamps: true});

DayPlanSchema.index({user: 1, date: 1}, {unique: true});
DayPlanSchema.plugin(uniqueValidator, {message: 'validation.unique'});
DayPlanSchema.plugin(mongoosePaginate);

DayPlanSchema.virtual("id").get(function () {
    return this._id.toString();
});


DayPlanSchema.set('toJSON', {getters: true, virtuals: true});

DayPlanSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'DayPlan';
const COLLECTION_NAME = 'DayPlan';
const DayPlanModel = mongoose.model<IDayPlan, PaginateModel<IDayPlan>>(MODEL_NAME, DayPlanSchema, COLLECTION_NAME);

export {
    DayPlanSchema,
    DayPlanModel
}

export default DayPlanModel
