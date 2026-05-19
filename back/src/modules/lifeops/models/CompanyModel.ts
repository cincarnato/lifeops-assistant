
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ICompany} from '../interfaces/ICompany'

const CompanySchema = new mongoose.Schema<ICompany>({
            name: {type: String,   required: true, index: true, unique: false },
            legalName: {type: String,   required: false, index: false, unique: false },
            taxIdType: {type: String,   required: false, index: false, unique: false },
            taxIdNumber: {type: String,   required: false, index: false, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            type: {type: String,   required: false, index: true, unique: false },
            status: {type: String,  enum: ['active', 'inactive', 'archived'], required: false, index: true, unique: false },
            website: {type: String,   required: false, index: false, unique: false },
            aliases: [{type: String,   required: false, index: true, unique: false }],
            emailDomains: [{type: String,   required: false, index: true, unique: false }],
            tags: [{type: String,   required: false, index: true, unique: false }],
            notes: {type: String,   required: false, index: false, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            archivedAt: {type: Date,   required: false, index: false, unique: false }
}, {timestamps: true});

CompanySchema.plugin(uniqueValidator, {message: 'validation.unique'});
CompanySchema.plugin(mongoosePaginate);

CompanySchema.virtual("id").get(function () {
    return this._id.toString();
});


CompanySchema.set('toJSON', {getters: true, virtuals: true});

CompanySchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Company';
const COLLECTION_NAME = 'Company';
const CompanyModel = mongoose.model<ICompany, PaginateModel<ICompany>>(MODEL_NAME, CompanySchema,COLLECTION_NAME);

export {
    CompanySchema,
    CompanyModel
}

export default CompanyModel
