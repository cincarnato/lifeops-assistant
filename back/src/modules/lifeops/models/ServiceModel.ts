
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IService} from '../interfaces/IService'

const ServiceSchema = new mongoose.Schema<IService>({
            name: {type: String,   required: true, index: false, unique: false },
            businessPartner: {type: mongoose.Schema.Types.ObjectId, ref: 'BusinessPartner',  required: true, index: true, unique: false },
            type: {type: String,  enum: ['INCOME', 'EXPENSE'], required: true, index: false, unique: false },
            amount: {type: Number, min: 0, required: true },
            frequency: {type: String,  enum: ['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'YEARLY', 'ON_DEMAND'], required: true, index: false, unique: false },
            active: {type: Boolean, required: true, default: true }
}, {timestamps: true});

ServiceSchema.plugin(uniqueValidator, {message: 'validation.unique'});
ServiceSchema.plugin(mongoosePaginate);

ServiceSchema.virtual("id").get(function () {
    return this._id.toString();
});


ServiceSchema.set('toJSON', {getters: true, virtuals: true});

ServiceSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Service';
const COLLECTION_NAME = 'Service';
const ServiceModel = mongoose.model<IService, PaginateModel<IService>>(MODEL_NAME, ServiceSchema,COLLECTION_NAME);

export {
    ServiceSchema,
    ServiceModel
}

export default ServiceModel
