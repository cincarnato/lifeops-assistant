
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IContact} from '../interfaces/IContact'

const ContactSchema = new mongoose.Schema<IContact>({
            firstName: {type: String,   required: true, index: false, unique: false },
            lastName: {type: String,   required: false, index: false, unique: false },
            displayName: {type: String,   required: true, index: true, unique: false },
            type: {type: String,   required: false, index: true, unique: false },
            priority: {type: String, required: false, index: true, unique: false },
            client: {type: mongoose.Schema.Types.ObjectId, ref: 'Client',  required: false, index: true, unique: false },
            company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company',  required: false, index: true, unique: false },
            jobTitle: {type: String,   required: false, index: false, unique: false },
            department: {type: String,   required: false, index: false, unique: false },
            aliases: [{type: String,   required: false, index: true, unique: false }],
            emails: [{type: String,   required: false, index: true, unique: false }],
            phones: [{type: String,   required: false, index: false, unique: false }],
            valueScore: {type: Number,   required: false, index: false, unique: false },
            relationshipScore: {type: Number,   required: false, index: false, unique: false },
            tags: [{type: String,   required: false, index: true, unique: false }],
            notes: {type: String,   required: false, index: false, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            archivedAt: {type: Date,   required: false, index: false, unique: false }
}, {timestamps: true});

ContactSchema.plugin(uniqueValidator, {message: 'validation.unique'});
ContactSchema.plugin(mongoosePaginate);

ContactSchema.virtual("id").get(function () {
    return this._id.toString();
});


ContactSchema.set('toJSON', {getters: true, virtuals: true});

ContactSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Contact';
const COLLECTION_NAME = 'Contact';
const ContactModel = mongoose.model<IContact, PaginateModel<IContact>>(MODEL_NAME, ContactSchema,COLLECTION_NAME);

export {
    ContactSchema,
    ContactModel
}

export default ContactModel
