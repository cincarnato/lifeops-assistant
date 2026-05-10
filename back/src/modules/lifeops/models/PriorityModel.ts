
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IPriority} from '../interfaces/IPriority'

const PrioritySchema = new mongoose.Schema<IPriority>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            color: {type: String,   required: true, index: false, unique: false }
}, {timestamps: true});

PrioritySchema.plugin(uniqueValidator, {message: 'validation.unique'});
PrioritySchema.plugin(mongoosePaginate);

PrioritySchema.virtual("id").get(function () {
    return this._id.toString();
});


PrioritySchema.set('toJSON', {getters: true, virtuals: true});

PrioritySchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Priority';
const COLLECTION_NAME = 'Priority';
const PriorityModel = mongoose.model<IPriority, PaginateModel<IPriority>>(MODEL_NAME, PrioritySchema,COLLECTION_NAME);

export {
    PrioritySchema,
    PriorityModel
}

export default PriorityModel
