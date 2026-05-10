
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IClientType} from '../interfaces/IClientType'

const ClientTypeSchema = new mongoose.Schema<IClientType>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

ClientTypeSchema.plugin(uniqueValidator, {message: 'validation.unique'});
ClientTypeSchema.plugin(mongoosePaginate);

ClientTypeSchema.virtual("id").get(function () {
    return this._id.toString();
});


ClientTypeSchema.set('toJSON', {getters: true, virtuals: true});

ClientTypeSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'ClientType';
const COLLECTION_NAME = 'ClientType';
const ClientTypeModel = mongoose.model<IClientType, PaginateModel<IClientType>>(MODEL_NAME, ClientTypeSchema,COLLECTION_NAME);

export {
    ClientTypeSchema,
    ClientTypeModel
}

export default ClientTypeModel
