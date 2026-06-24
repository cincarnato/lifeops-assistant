
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IMemory} from '../interfaces/IMemory'

const MemorySchema = new mongoose.Schema<IMemory>({
            title: {type: String,   required: true, index: true, unique: false },
            content: {type: String,   required: true, index: false, unique: false },
            type: {type: String,   required: true, index: true, unique: false },
            tags: [{type: String,   required: false, index: true, unique: false }],
            priority: {type: String,   required: false, index: true, unique: false },
            source: {type: String,   required: false, index: true, unique: false }
}, {timestamps: true});

MemorySchema.plugin(uniqueValidator, {message: 'validation.unique'});
MemorySchema.plugin(mongoosePaginate);

MemorySchema.virtual("id").get(function () {
    return this._id.toString();
});


MemorySchema.set('toJSON', {getters: true, virtuals: true});

MemorySchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Memory';
const COLLECTION_NAME = 'Memory';
const MemoryModel = mongoose.model<IMemory, PaginateModel<IMemory>>(MODEL_NAME, MemorySchema,COLLECTION_NAME);

export {
    MemorySchema,
    MemoryModel
}

export default MemoryModel
