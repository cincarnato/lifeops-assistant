
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IServiceTransaction} from '../interfaces/IServiceTransaction'

const ServiceTransactionSchema = new mongoose.Schema<IServiceTransaction>({
            service: {type: mongoose.Schema.Types.ObjectId, ref: 'Service',  required: true, index: true, unique: false },
            period: {type: String,   required: true, index: true, unique: false },
            amount: {type: Number,   required: true, index: false, unique: false },
            status: {type: String,  enum: ['PENDING', 'PAID'], required: true, index: false, unique: false },
            paidAt: {type: Date,   required: false, index: false, unique: false }
}, {timestamps: true});

ServiceTransactionSchema.plugin(uniqueValidator, {message: 'validation.unique'});
ServiceTransactionSchema.plugin(mongoosePaginate);

ServiceTransactionSchema.virtual("id").get(function () {
    return this._id.toString();
});


ServiceTransactionSchema.set('toJSON', {getters: true, virtuals: true});

ServiceTransactionSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'ServiceTransaction';
const COLLECTION_NAME = 'ServiceTransaction';
const ServiceTransactionModel = mongoose.model<IServiceTransaction, PaginateModel<IServiceTransaction>>(MODEL_NAME, ServiceTransactionSchema,COLLECTION_NAME);

export {
    ServiceTransactionSchema,
    ServiceTransactionModel
}

export default ServiceTransactionModel
