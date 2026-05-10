
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IProject} from '../interfaces/IProject'

const ProjectSchema = new mongoose.Schema<IProject>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            status: {type: String,  enum: ['idea', 'active', 'paused', 'completed', 'cancelled', 'archived'], required: false, index: true, unique: false },
            priority: {type: String, required: false, index: true, unique: false },
            goals: [{type: mongoose.Schema.Types.ObjectId, ref: 'Goal',  required: false, index: true, unique: false }],
            client: {type: mongoose.Schema.Types.ObjectId, ref: 'Client',  required: false, index: true, unique: false },
            valueScore: {type: Number,   required: false, index: false, unique: false },
            motivationScore: {type: Number,   required: false, index: false, unique: false },
            effortScore: {type: Number,   required: false, index: false, unique: false },
            priorityScore: {type: Number,   required: false, index: true, unique: false },
            startDate: {type: Date,   required: false, index: false, unique: false },
            targetDate: {type: Date,   required: false, index: true, unique: false },
            completedAt: {type: Date,   required: false, index: false, unique: false },
            progressPercent: {type: Number,   required: false, index: false, unique: false },
            tags: [{type: String,   required: false, index: true, unique: false }],
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            archivedAt: {type: Date,   required: false, index: false, unique: false }
}, {timestamps: true});

ProjectSchema.plugin(uniqueValidator, {message: 'validation.unique'});
ProjectSchema.plugin(mongoosePaginate);

ProjectSchema.virtual("id").get(function () {
    return this._id.toString();
});


ProjectSchema.set('toJSON', {getters: true, virtuals: true});

ProjectSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Project';
const COLLECTION_NAME = 'Project';
const ProjectModel = mongoose.model<IProject, PaginateModel<IProject>>(MODEL_NAME, ProjectSchema,COLLECTION_NAME);

export {
    ProjectSchema,
    ProjectModel
}

export default ProjectModel
