
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IMemoryType} from '../interfaces/IMemoryType'

const MemoryTypeSchema = new mongoose.Schema<IMemoryType>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: true, index: false, unique: false }
}, {timestamps: true});

MemoryTypeSchema.plugin(uniqueValidator, {message: 'validation.unique'});
MemoryTypeSchema.plugin(mongoosePaginate);

MemoryTypeSchema.virtual("id").get(function () {
    return this._id.toString();
});


MemoryTypeSchema.set('toJSON', {getters: true, virtuals: true});

MemoryTypeSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'MemoryType';
const COLLECTION_NAME = 'MemoryType';
const MemoryTypeModel = mongoose.model<IMemoryType, PaginateModel<IMemoryType>>(MODEL_NAME, MemoryTypeSchema,COLLECTION_NAME);

export {
    MemoryTypeSchema,
    MemoryTypeModel
}

export default MemoryTypeModel
