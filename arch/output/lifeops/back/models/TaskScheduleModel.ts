
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITaskSchedule} from '../interfaces/ITaskSchedule'

const TaskScheduleSchema = new mongoose.Schema<ITaskSchedule>({
            name: {type: String,   required: true, index: true, unique: false },
            active: {type: Boolean,   required: false, index: true, unique: false },
            task: {
            title: {type: String,   required: true, index: false, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            source: {type: String,   required: false, index: false, unique: false },
            type: {type: String,   required: false, index: false, unique: false },
            lifeArea: {type: String,   required: false, index: false, unique: false },
            status: {type: String,   required: false, index: false, unique: false },
            priority: {type: String,   required: false, index: false, unique: false },
            goals: [{type: mongoose.Schema.Types.ObjectId, ref: 'Goal',  required: false, index: false, unique: false }],
            project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project',  required: false, index: false, unique: false },
            valueScore: {type: Number,   required: false, index: false, unique: false },
            motivationScore: {type: Number,   required: false, index: false, unique: false },
            effortScore: {type: Number,   required: false, index: false, unique: false },
            urgent: {type: Boolean, default: false,  required: false, index: false, unique: false },
            tags: [{type: String,   required: false, index: false, unique: false }] 
            },
            schedule: {
            type: {type: String,  enum: ['once', 'interval', 'daily', 'weekly', 'monthly', 'yearly'], required: true, index: false, unique: false },
            time: {type: String,   required: false, index: false, unique: false },
            timezone: {type: String,   required: true, index: false, unique: false },
            interval: {
            every: {type: Number,   required: false, index: false, unique: false },
            unit: {type: String,  enum: ['minutes', 'hours', 'days', 'weeks', 'months'], required: false, index: false, unique: false } 
            },
            daysOfWeek: [{type: String,  enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], required: false, index: false, unique: false }],
            daysOfMonth: [{type: Number,   required: false, index: false, unique: false }],
            monthsOfYear: [{type: Number,   required: false, index: false, unique: false }],
            runAt: {type: Date,   required: false, index: false, unique: false },
            monthlyMode: {type: String,  enum: ['dayOfMonth', 'lastDayOfMonth'], required: false, index: false, unique: false } 
            },
            dueDateRule: {
            type: {type: String,  enum: ['none', 'sameDay', 'daysAfter'], required: false, index: false, unique: false },
            daysAfter: {type: Number,   required: false, index: false, unique: false } 
            },
            runtime: {
            lastRunAt: {type: Date,   required: false, index: false, unique: false },
            nextRunAt: {type: Date,   required: false, index: true, unique: false },
            lastTaskId: {type: mongoose.Schema.Types.ObjectId, ref: 'Task',  required: false, index: false, unique: false },
            lastStatus: {type: String,  enum: ['success', 'failed'], required: false, index: false, unique: false },
            lastError: {type: String,   required: false, index: false, unique: false } 
            },
            startAt: {type: Date,   required: false, index: true, unique: false },
            endAt: {type: Date,   required: false, index: true, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false }
}, {timestamps: true});

TaskScheduleSchema.plugin(uniqueValidator, {message: 'validation.unique'});
TaskScheduleSchema.plugin(mongoosePaginate);

TaskScheduleSchema.virtual("id").get(function () {
    return this._id.toString();
});


TaskScheduleSchema.set('toJSON', {getters: true, virtuals: true});

TaskScheduleSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'TaskSchedule';
const COLLECTION_NAME = 'TaskSchedule';
const TaskScheduleModel = mongoose.model<ITaskSchedule, PaginateModel<ITaskSchedule>>(MODEL_NAME, TaskScheduleSchema,COLLECTION_NAME);

export {
    TaskScheduleSchema,
    TaskScheduleModel
}

export default TaskScheduleModel
