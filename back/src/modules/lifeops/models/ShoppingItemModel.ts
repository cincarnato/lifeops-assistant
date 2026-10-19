
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IShoppingItem} from '../interfaces/IShoppingItem'

const ShoppingItemSchema = new mongoose.Schema<IShoppingItem>({
            name: {type: String, required: true, trim: true},
            quantity: {type: String, default: null},
            purchaseLocation: {type: String},
            purchased: {type: Boolean, default: false},
            purchasedAt: {type: Date, default: null},
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: false, unique: false }
}, {timestamps: true});

ShoppingItemSchema.plugin(uniqueValidator, {message: 'validation.unique'});
ShoppingItemSchema.plugin(mongoosePaginate);

ShoppingItemSchema.virtual("id").get(function () {
    return this._id.toString();
});


ShoppingItemSchema.set('toJSON', {getters: true, virtuals: true});

ShoppingItemSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'ShoppingItem';
const COLLECTION_NAME = 'ShoppingItem';
const ShoppingItemModel = mongoose.model<IShoppingItem, PaginateModel<IShoppingItem>>(MODEL_NAME, ShoppingItemSchema,COLLECTION_NAME);

export {
    ShoppingItemSchema,
    ShoppingItemModel
}

export default ShoppingItemModel
