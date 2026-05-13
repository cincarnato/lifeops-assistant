
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IAgentJobExecution} from '../interfaces/IAgentJobExecution'

const AgentJobExecutionSchema = new mongoose.Schema<IAgentJobExecution>({
            jobId: {type: mongoose.Schema.Types.ObjectId, ref: 'AgentJob',  required: true, index: true, unique: false },
            status: {type: String,  enum: ['pending', 'running', 'success', 'failed', 'timeout'], required: true, index: true, unique: false },
            trigger: {type: String,  enum: ['scheduled', 'manual', 'retry'], default: 'scheduled', required: true, index: false, unique: false },
            scheduledFor: {type: Date,   required: false, index: true, unique: false },
            startedAt: {type: Date,   required: false, index: false, unique: false },
            finishedAt: {type: Date,   required: false, index: false, unique: false },
            durationMs: {type: Number,   required: false, index: false, unique: false },
            attempt: {type: Number, default: 1,  required: false, index: false, unique: false },
            promptSnapshot: {
            systemPrompt: {type: String,   required: false, index: false, unique: false },
            allowedTools: {type: [{type: String,   required: false, index: false, unique: false }], default: []} 
            },
            result: {
            summary: {type: String,   required: false, index: false, unique: false },
            actions: [{ 
                        type: {type: String,   required: true, index: false, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            entityType: {type: String,   required: false, index: false, unique: false },
            entityId: {type: String,   required: false, index: false, unique: false },
            status: {type: String,  enum: ['success', 'failed'], default: 'success', required: false, index: false, unique: false } 
            }],
            data: {type: mongoose.Schema.Types.Mixed,   required: false, index: false, unique: false },
            outcome: {type: String,   required: false, index: false, unique: false } 
            },
            toolCalls: [{ 
                        name: {type: String,   required: true, index: false, unique: false },
            status: {type: String,  enum: ['success', 'failed'], required: true, index: false, unique: false },
            input: {type: mongoose.Schema.Types.Mixed,   required: false, index: false, unique: false },
            output: {type: mongoose.Schema.Types.Mixed,   required: false, index: false, unique: false },
            errorMessage: {type: String,   required: false, index: false, unique: false },
            durationMs: {type: Number,   required: false, index: false, unique: false } 
            }],
            error: {
            code: {type: String,   required: false, index: false, unique: false },
            message: {type: String,   required: false, index: false, unique: false } 
            },
            usage: {
            model: {type: String,   required: false, index: false, unique: false },
            inputTokens: {type: Number,   required: false, index: false, unique: false },
            outputTokens: {type: Number,   required: false, index: false, unique: false },
            totalTokens: {type: Number,   required: false, index: false, unique: false } 
            }
}, {timestamps: true});

AgentJobExecutionSchema.plugin(uniqueValidator, {message: 'validation.unique'});
AgentJobExecutionSchema.plugin(mongoosePaginate);

AgentJobExecutionSchema.virtual("id").get(function () {
    return this._id.toString();
});


AgentJobExecutionSchema.set('toJSON', {getters: true, virtuals: true});

AgentJobExecutionSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'AgentJobExecution';
const COLLECTION_NAME = 'AgentJobExecution';
const AgentJobExecutionModel = mongoose.model<IAgentJobExecution, PaginateModel<IAgentJobExecution>>(MODEL_NAME, AgentJobExecutionSchema,COLLECTION_NAME);

export {
    AgentJobExecutionSchema,
    AgentJobExecutionModel
}

export default AgentJobExecutionModel
