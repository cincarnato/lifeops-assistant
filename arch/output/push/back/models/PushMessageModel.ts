
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IPushMessage} from '../interfaces/IPushMessage'

const PushMessageSchema = new mongoose.Schema<IPushMessage>({
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            title: {type: String,   required: true, index: false, unique: false },
            body: {type: String,   required: true, index: false, unique: false },
            status: {type: String,  enum: ['pending', 'sent', 'failed', 'read'], required: true, index: true, unique: false },
            providerMessageId: {type: String,   required: false, index: true, unique: false },
            type: {type: String,   required: false, index: true, unique: false },
            errorMessage: {type: String,   required: false, index: false, unique: false },
            sentAt: {type: Date,   required: false, index: true, unique: false }
}, {timestamps: true});

PushMessageSchema.plugin(uniqueValidator, {message: 'validation.unique'});
PushMessageSchema.plugin(mongoosePaginate);

PushMessageSchema.virtual("id").get(function () {
    return this._id.toString();
});


PushMessageSchema.set('toJSON', {getters: true, virtuals: true});

PushMessageSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'PushMessage';
const COLLECTION_NAME = 'PushMessage';
const PushMessageModel = mongoose.model<IPushMessage, PaginateModel<IPushMessage>>(MODEL_NAME, PushMessageSchema,COLLECTION_NAME);

export {
    PushMessageSchema,
    PushMessageModel
}

export default PushMessageModel
