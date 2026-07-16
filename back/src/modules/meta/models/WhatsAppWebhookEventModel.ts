import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IWhatsAppWebhookEvent} from '../interfaces/IWhatsAppWebhookEvent'

const WhatsAppWebhookEventSchema = new mongoose.Schema<IWhatsAppWebhookEvent>({
    tenantId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: false, index: true, unique: false},
    phoneNumberRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WhatsAppPhoneNumber',
        required: false,
        index: true,
        unique: false
    },
    object: {type: String, required: true, index: false, unique: false, trim: true},
    field: {type: String, required: true, index: true, unique: false, trim: true},
    wabaId: {type: String, required: false, index: true, unique: false, trim: true},
    phoneNumberId: {type: String, required: false, index: true, unique: false, trim: true},
    receivedAt: {type: Date, required: true, index: true, unique: false, default: Date.now},
    eventAt: {type: Date, required: false, index: true, unique: false},
    processingStatus: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'PROCESSED', 'IGNORED', 'ERROR'],
        required: true,
        index: true,
        unique: false,
        default: 'PENDING'
    },
    processingAttempts: {type: Number, required: true, index: false, unique: false, default: 0},
    processedAt: {type: Date, required: false, index: false, unique: false},
    lastProcessingAttemptAt: {type: Date, required: false, index: false, unique: false},
    lastError: {
        message: {type: String, required: false, index: false, unique: false},
        stack: {type: String, required: false, index: false, unique: false},
        code: {type: String, required: false, index: false, unique: false}
    },
    payload: {type: mongoose.Schema.Types.Mixed, required: true},
    deduplicationKey: {type: String, required: false, unique: false, trim: true}
}, {timestamps: true, minimize: false});

WhatsAppWebhookEventSchema.index(
    {deduplicationKey: 1},
    {unique: true, sparse: true}
);

WhatsAppWebhookEventSchema.index({
    processingStatus: 1,
    receivedAt: 1
});

WhatsAppWebhookEventSchema.index({
    phoneNumberId: 1,
    receivedAt: -1
});

WhatsAppWebhookEventSchema.index({
    wabaId: 1,
    field: 1,
    receivedAt: -1
});

WhatsAppWebhookEventSchema.plugin(uniqueValidator, {message: 'validation.unique'});
WhatsAppWebhookEventSchema.plugin(mongoosePaginate);

WhatsAppWebhookEventSchema.virtual("id").get(function () {
    return this._id.toString();
});


WhatsAppWebhookEventSchema.set('toJSON', {getters: true, virtuals: true});

WhatsAppWebhookEventSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'WhatsAppWebhookEvent';
const COLLECTION_NAME = 'whatsappWebhookEvents';
const WhatsAppWebhookEventModel = mongoose.model<IWhatsAppWebhookEvent, PaginateModel<IWhatsAppWebhookEvent>>(MODEL_NAME, WhatsAppWebhookEventSchema, COLLECTION_NAME);

export {
    WhatsAppWebhookEventSchema,
    WhatsAppWebhookEventModel
}

export default WhatsAppWebhookEventModel
