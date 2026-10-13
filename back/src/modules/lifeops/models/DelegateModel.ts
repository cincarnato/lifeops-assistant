import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IDelegate} from '../interfaces/IDelegate'

const DelegateSchema = new mongoose.Schema<IDelegate>({
            contact: {type: mongoose.Schema.Types.ObjectId, ref: 'Contact',  required: true, index: false, unique: false },
            skills: [{type: String,   required: false, index: false, unique: false }],
            description: {type: String,   required: false, index: false, unique: false },
            active: {type: Boolean, default: true, required: false, index: false, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false }
}, {timestamps: true});

DelegateSchema.plugin(uniqueValidator, {message: 'validation.unique'});
DelegateSchema.plugin(mongoosePaginate);

DelegateSchema.virtual("id").get(function () {
    return this._id.toString();
});


DelegateSchema.set('toJSON', {getters: true, virtuals: true});

DelegateSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Delegate';
const COLLECTION_NAME = 'Delegate';
const DelegateModel = mongoose.model<IDelegate, PaginateModel<IDelegate>>(MODEL_NAME, DelegateSchema,COLLECTION_NAME);

export {
    DelegateSchema,
    DelegateModel
}

export default DelegateModel
