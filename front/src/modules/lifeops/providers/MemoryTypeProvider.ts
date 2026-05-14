
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IMemoryType, IMemoryTypeBase} from '../interfaces/IMemoryType'

class MemoryTypeProvider extends AbstractCrudRestProvider<IMemoryType, IMemoryTypeBase, IMemoryTypeBase> {
    
  static singleton: MemoryTypeProvider
    
  constructor() {
   super('/api/memory-types')
  }
  
  static get instance() {
    if(!MemoryTypeProvider.singleton){
      MemoryTypeProvider.singleton = new MemoryTypeProvider()
    }
    return MemoryTypeProvider.singleton
  }

}

export default MemoryTypeProvider

