
import type{IInstructionRepository} from "../interfaces/IInstructionRepository";
import type {IInstructionBase, IInstruction} from "../interfaces/IInstruction";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class InstructionService extends AbstractService<IInstruction, IInstructionBase, IInstructionBase> {


    constructor(InstructionRepository: IInstructionRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(InstructionRepository, baseSchema, fullSchema);

        this._validateOutput = true

    }

}

export default InstructionService
export {InstructionService}
