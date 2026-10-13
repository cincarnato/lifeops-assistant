
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IInstruction, IInstructionBase} from '../interfaces/IInstruction'

class InstructionProvider extends AbstractCrudRestProvider<IInstruction, IInstructionBase, IInstructionBase> {

  static singleton: InstructionProvider

  constructor() {
   super('/api/instructions')
  }

  static get instance() {
    if(!InstructionProvider.singleton){
      InstructionProvider.singleton = new InstructionProvider()
    }
    return InstructionProvider.singleton
  }

}

export default InstructionProvider
