
import {AbstractMongoRepository} from "@drax/crud-back";
import {InstructionModel} from "../../models/InstructionModel.js";
import type {IInstructionRepository} from '../../interfaces/IInstructionRepository'
import type {IInstruction, IInstructionBase} from "../../interfaces/IInstruction";


class InstructionMongoRepository extends AbstractMongoRepository<IInstruction, IInstructionBase, IInstructionBase> implements IInstructionRepository {

    constructor() {
        super();
        this._model = InstructionModel;
        this._searchFields = ['title'];
        this._populateFields = ['tenant'];
        this._lean = true
    }

}

export default InstructionMongoRepository
export {InstructionMongoRepository}
