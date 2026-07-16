
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IWhatsAppPhoneNumber} from '../interfaces/IWhatsAppPhoneNumber'

const WhatsAppPhoneNumberSchema = new mongoose.Schema<IWhatsAppPhoneNumber>({
            tenantId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant',  required: true, index: true, unique: false },
            phoneNumberId: {type: String,   required: true, index: true, unique: false, trim: true },
            wabaId: {type: String,   required: true, index: true, unique: false, trim: true },
            displayPhoneNumber: {type: String,   required: true, index: false, unique: false, trim: true },
            enabled: {type: Boolean,   required: true, index: true, unique: false, default: true }
}, {timestamps: true});

WhatsAppPhoneNumberSchema.index(
    {tenantId: 1, phoneNumberId: 1},
    {unique: true}
);

WhatsAppPhoneNumberSchema.plugin(uniqueValidator, {message: 'validation.unique'});
WhatsAppPhoneNumberSchema.plugin(mongoosePaginate);

WhatsAppPhoneNumberSchema.virtual("id").get(function () {
    return this._id.toString();
});


WhatsAppPhoneNumberSchema.set('toJSON', {getters: true, virtuals: true});

WhatsAppPhoneNumberSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'WhatsAppPhoneNumber';
const COLLECTION_NAME = 'whatsappPhoneNumbers';
const WhatsAppPhoneNumberModel = mongoose.model<IWhatsAppPhoneNumber, PaginateModel<IWhatsAppPhoneNumber>>(MODEL_NAME, WhatsAppPhoneNumberSchema,COLLECTION_NAME);

export {
    WhatsAppPhoneNumberSchema,
    WhatsAppPhoneNumberModel
}

export default WhatsAppPhoneNumberModel
