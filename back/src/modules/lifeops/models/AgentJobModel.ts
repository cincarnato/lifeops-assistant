
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IAgentJob} from '../interfaces/IAgentJob'

const AgentJobSchema = new mongoose.Schema<IAgentJob>({
            name: {type: String, trim: true, maxlength: 120,  required: true, index: true, unique: false },
            description: {type: String, trim: true, maxlength: 500,  required: false, index: false, unique: false },
            active: {type: Boolean, default: true,  required: false, index: true, unique: false },
            agent: {
            systemPrompt: {type: String,   required: true, index: false, unique: false },
            allowedTools: {type: [{type: String,   required: false, index: false, unique: false }], default: []} 
            },
            schedule: {
            type: {type: String,  enum: ['once', 'daily', 'weekly', 'monthly', 'interval', 'cron'], required: true, index: false, unique: false },
            timezone: {type: String, default: 'America/Argentina/Buenos_Aires',  required: true, index: false, unique: false },
            runAt: {type: Date,   required: false, index: false, unique: false },
            time: {type: String,   required: false, index: false, unique: false },
            daysOfWeek: {type: [{type: String,  enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], required: false, index: false, unique: false }], default: undefined},
            daysOfMonth: {type: [{type: Number,   required: false, index: false, unique: false }], default: undefined},
            interval: {
            every: {type: Number, min: 1,  required: false, index: false, unique: false },
            unit: {type: String,  enum: ['minutes', 'hours', 'days'], required: false, index: false, unique: false } 
            },
            cronExpression: {type: String,   required: false, index: false, unique: false } 
            },
            execution: {
            timeoutSeconds: {type: Number, default: 300,  required: false, index: false, unique: false },
            maxRetries: {type: Number, default: 0,  required: false, index: false, unique: false } 
            },
            runtime: {
            lastRunAt: {type: Date,   required: false, index: false, unique: false },
            nextRunAt: {type: Date,   required: false, index: true, unique: false },
            lastStatus: {type: String,  enum: ['success', 'failed', 'timeout'], required: false, index: false, unique: false } 
            },
            createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: false, index: true, unique: false }
}, {timestamps: true});

AgentJobSchema.plugin(uniqueValidator, {message: 'validation.unique'});
AgentJobSchema.plugin(mongoosePaginate);

AgentJobSchema.virtual("id").get(function () {
    return this._id.toString();
});


AgentJobSchema.set('toJSON', {getters: true, virtuals: true});

AgentJobSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'AgentJob';
const COLLECTION_NAME = 'AgentJob';
const AgentJobModel = mongoose.model<IAgentJob, PaginateModel<IAgentJob>>(MODEL_NAME, AgentJobSchema,COLLECTION_NAME);

export {
    AgentJobSchema,
    AgentJobModel
}

export default AgentJobModel
