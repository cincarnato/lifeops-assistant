
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IClient} from '../interfaces/IClient'

const ClientSchema = new mongoose.Schema<IClient>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            type: {type: String,  enum: ['company', 'person', 'internal', 'partner'], required: false, index: true, unique: false },
            status: {type: String,  enum: ['active', 'inactive', 'prospect', 'paused', 'archived'], required: false, index: true, unique: false },
            priority: {type: String,   required: false, index: true, unique: false },
            valueScore: {type: Number,   required: false, index: false, unique: false },
            relationshipScore: {type: Number,   required: false, index: false, unique: false },
            priorityScore: {type: Number,   required: false, index: true, unique: false },
            website: {type: String,   required: false, index: false, unique: false },
            emailDomains: [{type: String,   required: false, index: true, unique: false }],
            company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company',  required: true, index: true, unique: false },
            mainContact: {type: mongoose.Schema.Types.ObjectId, ref: 'Contact',  required: false, index: true, unique: false },
            redmineProjectIds: [{type: String,   required: false, index: true, unique: false }],
            tags: [{type: String,   required: false, index: true, unique: false }],
            notes: {type: String,   required: false, index: false, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            archivedAt: {type: Date,   required: false, index: false, unique: false }
}, {timestamps: true});

ClientSchema.plugin(uniqueValidator, {message: 'validation.unique'});
ClientSchema.plugin(mongoosePaginate);

ClientSchema.virtual("id").get(function () {
    return this._id.toString();
});


ClientSchema.set('toJSON', {getters: true, virtuals: true});

ClientSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Client';
const COLLECTION_NAME = 'Client';
const ClientModel = mongoose.model<IClient, PaginateModel<IClient>>(MODEL_NAME, ClientSchema,COLLECTION_NAME);

export {
    ClientSchema,
    ClientModel
}

export default ClientModel
