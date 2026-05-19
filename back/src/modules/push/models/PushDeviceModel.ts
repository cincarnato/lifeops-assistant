
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IPushDevice} from '../interfaces/IPushDevice'

const PushDeviceSchema = new mongoose.Schema<IPushDevice>({
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            platform: {type: String,  enum: ['android', 'ios', 'web'], required: true, index: true, unique: false },
            token: {type: String,   required: true, index: true, unique: true },
            deviceName: {type: String,   required: false, index: false, unique: false },
            enabled: {type: Boolean,   required: true, index: true, unique: false },
            lastSeenAt: {type: Date,   required: false, index: true, unique: false }
}, {timestamps: true});

PushDeviceSchema.plugin(uniqueValidator, {message: 'validation.unique'});
PushDeviceSchema.plugin(mongoosePaginate);

PushDeviceSchema.virtual("id").get(function () {
    return this._id.toString();
});


PushDeviceSchema.set('toJSON', {getters: true, virtuals: true});

PushDeviceSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'PushDevice';
const COLLECTION_NAME = 'PushDevice';
const PushDeviceModel = mongoose.model<IPushDevice, PaginateModel<IPushDevice>>(MODEL_NAME, PushDeviceSchema,COLLECTION_NAME);

export {
    PushDeviceSchema,
    PushDeviceModel
}

export default PushDeviceModel
