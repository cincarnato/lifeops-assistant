
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IBusinessPartner} from '../interfaces/IBusinessPartner'

const BusinessPartnerSchema = new mongoose.Schema<IBusinessPartner>({
            name: {type: String,   required: true, index: true, unique: false },
            legalName: {type: String,   required: false, index: false, unique: false },
            taxCondition: {type: String,   required: false, index: false, unique: false },
            taxIdType: {type: String,   required: false, index: false, unique: false },
            taxIdNumber: {type: String,   required: false, index: false, unique: false },
            taxAddress: {type: String,   required: false, index: false, unique: false },
            taxEmail: {type: String,   required: false, index: false, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            roles: {type: [{type: String, enum: ['client', 'provider']}], required: true, index: true, default: []},
            priority: {type: String, required: false, index: true, unique: false },
            website: {type: String,   required: false, index: false, unique: false },
            aliases: [{type: String,   required: false, index: true, unique: false }],
            mainContact: {type: mongoose.Schema.Types.ObjectId, ref: 'Contact',  required: false, index: true, unique: false },
            tags: [{type: String,   required: false, index: true, unique: false }],
            notes: {type: String,   required: false, index: false, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            archivedAt: {type: Date,   required: false, index: false, unique: false }
}, {timestamps: true});

BusinessPartnerSchema.plugin(uniqueValidator, {message: 'validation.unique'});
BusinessPartnerSchema.plugin(mongoosePaginate);

BusinessPartnerSchema.virtual("id").get(function () {
    return this._id.toString();
});


BusinessPartnerSchema.set('toJSON', {getters: true, virtuals: true});

BusinessPartnerSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'BusinessPartner';
const COLLECTION_NAME = 'BusinessPartner';
const BusinessPartnerModel = mongoose.model<IBusinessPartner, PaginateModel<IBusinessPartner>>(MODEL_NAME, BusinessPartnerSchema,COLLECTION_NAME);

export {
    BusinessPartnerSchema,
    BusinessPartnerModel
}

export default BusinessPartnerModel
