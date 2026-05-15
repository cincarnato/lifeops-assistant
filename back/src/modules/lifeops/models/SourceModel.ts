
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ISource} from '../interfaces/ISource'

const SourceSchema = new mongoose.Schema<ISource>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

SourceSchema.plugin(uniqueValidator, {message: 'validation.unique'});
SourceSchema.plugin(mongoosePaginate);

SourceSchema.virtual("id").get(function () {
    return this._id.toString();
});


SourceSchema.set('toJSON', {getters: true, virtuals: true});

SourceSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Source';
const COLLECTION_NAME = 'Source';
const SourceModel = mongoose.model<ISource, PaginateModel<ISource>>(MODEL_NAME, SourceSchema,COLLECTION_NAME);

export {
    SourceSchema,
    SourceModel
}

export default SourceModel
