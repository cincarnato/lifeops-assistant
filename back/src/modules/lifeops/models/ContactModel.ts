import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IContact} from '../interfaces/IContact'

const ContactEmailSchema = new mongoose.Schema({
    value: {type: String, required: true, index: true},
    type: {type: String, required: false, default: "other"},
    primary: {type: Boolean, required: false, default: false},
    displayName: {type: String, required: false, default: ""},
}, {_id: false});

const ContactPhoneSchema = new mongoose.Schema({
    value: {type: String, required: true, index: true},
    normalizedValue: {type: String, required: false, index: true, default: ""},
    type: {type: String, required: false, default: "other"},
    primary: {type: Boolean, required: false, default: false},
}, {_id: false});

const ContactAddressSchema = new mongoose.Schema({
    formattedValue: {type: String, required: false, default: ""},
    type: {type: String, required: false, default: "other"},
    streetAddress: {type: String, required: false, default: ""},
    city: {type: String, required: false, default: ""},
    region: {type: String, required: false, default: ""},
    postalCode: {type: String, required: false, default: ""},
    country: {type: String, required: false, default: ""},
    countryCode: {type: String, required: false, default: ""},
    primary: {type: Boolean, required: false, default: false},
}, {_id: false});

const ContactOrganizationSchema = new mongoose.Schema({
    name: {type: String, required: false, index: true, default: ""},
    title: {type: String, required: false, index: true, default: ""},
    department: {type: String, required: false, index: true, default: ""},
    domain: {type: String, required: false, index: true, default: ""},
}, {_id: false});

const ContactBirthdaySchema = new mongoose.Schema({
    year: {type: Number, required: false},
    month: {type: Number, required: false},
    day: {type: Number, required: false},
}, {_id: false});

const ContactSchema = new mongoose.Schema<IContact>({
    source: {type: String, required: true, enum: ['manual', 'google', 'imported', 'api'], default: 'manual', index: true},
    externalProvider: {type: String, required: false, enum: ['google'], index: true},
    externalId: {type: String, required: false, index: true},
    externalEtag: {type: String, required: false},
    externalRaw: {type: mongoose.Schema.Types.Mixed, required: false},
    displayName: {type: String, required: true, index: true},
    givenName: {type: String, required: false, index: true, default: ""},
    familyName: {type: String, required: false, index: true, default: ""},
    nickname: {type: String, required: false, index: true, default: ""},
    emails: {type: [ContactEmailSchema], required: false, default: []},
    phones: {type: [ContactPhoneSchema], required: false, default: []},
    organization: {type: ContactOrganizationSchema, required: false, default: {}},
    addresses: {type: [ContactAddressSchema], required: false, default: []},
    photoUrl: {type: String, required: false, default: ""},
    birthday: {type: ContactBirthdaySchema, required: false},
    notes: {type: String, required: false, default: ""},
    tags: [{type: String, required: false, index: true}],
    status: {type: String, required: false, enum: ['active', 'archived', 'deleted'], default: 'active', index: true},
    lastSyncedAt: {type: Date, required: false},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
}, {timestamps: true});

ContactSchema.index({user: 1, externalProvider: 1, externalId: 1});

ContactSchema.plugin(uniqueValidator, {message: 'validation.unique'});
ContactSchema.plugin(mongoosePaginate);

ContactSchema.virtual("id").get(function () {
    return this._id.toString();
});

ContactSchema.set('toJSON', {getters: true, virtuals: true});
ContactSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Contact';
const COLLECTION_NAME = 'Contact';
const ContactModel = mongoose.model<IContact, PaginateModel<IContact>>(MODEL_NAME, ContactSchema, COLLECTION_NAME);

export {
    ContactSchema,
    ContactModel
}

export default ContactModel
