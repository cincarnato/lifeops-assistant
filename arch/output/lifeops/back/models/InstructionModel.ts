
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IInstruction} from '../interfaces/IInstruction'

const InstructionSchema = new mongoose.Schema<IInstruction>({
            title: {type: String,   required: true, index: false, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            content: {type: String,   required: true, index: false, unique: false }
}, {timestamps: true});

InstructionSchema.plugin(uniqueValidator, {message: 'validation.unique'});
InstructionSchema.plugin(mongoosePaginate);

InstructionSchema.virtual("id").get(function () {
    return this._id.toString();
});


InstructionSchema.set('toJSON', {getters: true, virtuals: true});

InstructionSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Instruction';
const COLLECTION_NAME = 'Instruction';
const InstructionModel = mongoose.model<IInstruction, PaginateModel<IInstruction>>(MODEL_NAME, InstructionSchema,COLLECTION_NAME);

export {
    InstructionSchema,
    InstructionModel
}

export default InstructionModel
