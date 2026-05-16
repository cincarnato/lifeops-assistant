
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ILifeArea} from '../interfaces/ILifeArea'

const LifeAreaSchema = new mongoose.Schema<ILifeArea>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

LifeAreaSchema.plugin(uniqueValidator, {message: 'validation.unique'});
LifeAreaSchema.plugin(mongoosePaginate);

LifeAreaSchema.virtual("id").get(function () {
    return this._id.toString();
});


LifeAreaSchema.set('toJSON', {getters: true, virtuals: true});

LifeAreaSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'LifeArea';
const COLLECTION_NAME = 'LifeArea';
const LifeAreaModel = mongoose.model<ILifeArea, PaginateModel<ILifeArea>>(MODEL_NAME, LifeAreaSchema,COLLECTION_NAME);

export {
    LifeAreaSchema,
    LifeAreaModel
}

export default LifeAreaModel
