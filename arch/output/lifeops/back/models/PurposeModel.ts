
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IPurpose} from '../interfaces/IPurpose'

const PurposeSchema = new mongoose.Schema<IPurpose>({
            title: {type: String,   required: true, index: true, unique: false },
            statement: {type: String,   required: true, index: false, unique: false },
            isPrimary: {type: Boolean,   required: false, index: true, unique: false },
            active: {type: Boolean,   required: false, index: true, unique: false }
}, {timestamps: true});

PurposeSchema.plugin(uniqueValidator, {message: 'validation.unique'});
PurposeSchema.plugin(mongoosePaginate);

PurposeSchema.virtual("id").get(function () {
    return this._id.toString();
});


PurposeSchema.set('toJSON', {getters: true, virtuals: true});

PurposeSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Purpose';
const COLLECTION_NAME = 'Purpose';
const PurposeModel = mongoose.model<IPurpose, PaginateModel<IPurpose>>(MODEL_NAME, PurposeSchema,COLLECTION_NAME);

export {
    PurposeSchema,
    PurposeModel
}

export default PurposeModel
