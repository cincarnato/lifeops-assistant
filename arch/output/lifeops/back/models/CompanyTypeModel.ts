
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ICompanyType} from '../interfaces/ICompanyType'

const CompanyTypeSchema = new mongoose.Schema<ICompanyType>({
            name: {type: String,   required: true, index: true, unique: false },
            description: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

CompanyTypeSchema.plugin(uniqueValidator, {message: 'validation.unique'});
CompanyTypeSchema.plugin(mongoosePaginate);

CompanyTypeSchema.virtual("id").get(function () {
    return this._id.toString();
});


CompanyTypeSchema.set('toJSON', {getters: true, virtuals: true});

CompanyTypeSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'CompanyType';
const COLLECTION_NAME = 'CompanyType';
const CompanyTypeModel = mongoose.model<ICompanyType, PaginateModel<ICompanyType>>(MODEL_NAME, CompanyTypeSchema,COLLECTION_NAME);

export {
    CompanyTypeSchema,
    CompanyTypeModel
}

export default CompanyTypeModel
