
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IGoogleConnection} from '../interfaces/IGoogleConnection'

const GoogleConnectionSchema = new mongoose.Schema<IGoogleConnection>({
            userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            provider: {type: String,  enum: ['google'], required: true, index: true, unique: false },
            googleEmail: {type: String,   required: true, index: true, unique: false },
            googleUserId: {type: String,   required: true, index: true, unique: true },
            accessToken: {type: String,   required: false, index: false, unique: false },
            refreshToken: {type: String,   required: true, index: false, unique: false },
            scope: [{type: String,   required: true, index: false, unique: false }],
            expiryDate: {type: Date,   required: true, index: true, unique: false },
            status: {type: String,  enum: ['active', 'revoked', 'error'], required: true, index: true, unique: false },
            lastUsedAt: {type: Date,   required: false, index: true, unique: false },
            connectedAt: {type: Date,   required: true, index: true, unique: false }
}, {timestamps: true});

GoogleConnectionSchema.plugin(uniqueValidator, {message: 'validation.unique'});
GoogleConnectionSchema.plugin(mongoosePaginate);

GoogleConnectionSchema.virtual("id").get(function () {
    return this._id.toString();
});


GoogleConnectionSchema.set('toJSON', {getters: true, virtuals: true});

GoogleConnectionSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'GoogleConnection';
const COLLECTION_NAME = 'GoogleConnection';
const GoogleConnectionModel = mongoose.model<IGoogleConnection, PaginateModel<IGoogleConnection>>(MODEL_NAME, GoogleConnectionSchema,COLLECTION_NAME);

export {
    GoogleConnectionSchema,
    GoogleConnectionModel
}

export default GoogleConnectionModel
