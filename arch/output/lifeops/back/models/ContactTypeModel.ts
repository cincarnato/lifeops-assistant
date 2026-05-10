
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IContactType} from '../interfaces/IContactType'

const ContactTypeSchema = new mongoose.Schema<IContactType>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

ContactTypeSchema.plugin(uniqueValidator, {message: 'validation.unique'});
ContactTypeSchema.plugin(mongoosePaginate);

ContactTypeSchema.virtual("id").get(function () {
    return this._id.toString();
});


ContactTypeSchema.set('toJSON', {getters: true, virtuals: true});

ContactTypeSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'ContactType';
const COLLECTION_NAME = 'ContactType';
const ContactTypeModel = mongoose.model<IContactType, PaginateModel<IContactType>>(MODEL_NAME, ContactTypeSchema,COLLECTION_NAME);

export {
    ContactTypeSchema,
    ContactTypeModel
}

export default ContactTypeModel
