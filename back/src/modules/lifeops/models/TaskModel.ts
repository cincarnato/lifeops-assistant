import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITask} from '../interfaces/ITask'

const TaskSchemaDefinition = {
    title: {type: String, required: true, index: true, unique: false},
    description: {type: String, required: false, index: false, unique: false},
    source: {type: String, required: false, index: true, unique: false},
    type: {type: String, required: false, index: true, unique: false},
    lifeArea: {type: String, required: false, index: true, unique: false},
    status: {type: String, required: false, index: true, unique: false},
    priority: {type: String, required: false, index: true, unique: false},
    goals: [{type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: false, index: true, unique: false}],
    project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false, index: true, unique: false},
    valueScore: {type: Number, required: false, index: true, unique: false},
    motivationScore: {type: Number, required: false, index: false, unique: false},
    effortScore: {type: Number, required: false, index: false, unique: false},
    urgencyScore: {type: Number, required: false, index: false, unique: false},
    dueDate: {type: Date, required: false, index: true, unique: false},
    scheduledDate: {type: Date, required: false, index: true, unique: false},
    taskSchedule: {type: mongoose.Schema.Types.ObjectId, ref: 'TaskSchedule', required: false, index: true, unique: false},
    scheduledFor: {type: Date, required: false, index: true, unique: false},
    redmineIssueId: {type: String, required: false, index: true, unique: false},
    emailMessageId: {type: String, required: false, index: true, unique: false},
    calendarEventId: {type: String, required: false, index: true, unique: false},
    tags: [{type: String, required: false, index: true, unique: false}],
    notes: [{
        date: {type: Date, required: false},
        note: {type: String, required: true}
    }],
    statusHistory: [{
        date: {type: Date, required: false},
        previousStatus: {type: String, required: false},
        newStatus: {type: String, required: false}
    }],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: false},
    completedAt: {type: Date, required: false, index: false, unique: false},
    archivedAt: {type: Date, required: false, index: false, unique: false}
};

const TaskSchemaOptions = {timestamps: true};

interface BuildTaskSchemaOptions {
    archiveLookupIndex?: boolean
}

function buildTaskSchema<T = ITask>(
    extraDefinition: Record<string, any> = {},
    options: BuildTaskSchemaOptions = {}
) {
    const schema = new mongoose.Schema<T>({
        ...TaskSchemaDefinition,
        ...extraDefinition
    }, TaskSchemaOptions);

    if (options.archiveLookupIndex !== false) {
        schema.index({archivedAt: 1});
    }
    schema.index(
        {taskSchedule: 1, scheduledFor: 1},
        {
            unique: true,
            partialFilterExpression: {
                taskSchedule: {$exists: true},
                scheduledFor: {$exists: true}
            }
        }
    );
    schema.plugin(uniqueValidator, {message: 'validation.unique'});
    schema.plugin(mongoosePaginate);

    schema.virtual("id").get(function () {
        return this._id.toString();
    });

    schema.set('toJSON', {getters: true, virtuals: true});
    schema.set('toObject', {getters: true, virtuals: true});

    return schema;
}

const TaskSchema = buildTaskSchema<ITask>();

const MODEL_NAME = 'Task';
const COLLECTION_NAME = 'Task';
const TaskModel = mongoose.model<ITask, PaginateModel<ITask>>(MODEL_NAME, TaskSchema, COLLECTION_NAME);

export {
    TaskSchemaDefinition,
    TaskSchemaOptions,
    buildTaskSchema,
    TaskSchema,
    TaskModel
}

export default TaskModel
