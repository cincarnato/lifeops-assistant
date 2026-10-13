
import type {IInstruction, IInstructionBase} from './IInstruction'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IInstructionRepository extends IDraxCrudRepository<IInstruction, IInstructionBase, IInstructionBase>{

}

export {IInstructionRepository}
