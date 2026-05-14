
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IMemory, IMemoryBase} from '../interfaces/IMemory'

class MemoryProvider extends AbstractCrudRestProvider<IMemory, IMemoryBase, IMemoryBase> {
    
  static singleton: MemoryProvider
    
  constructor() {
   super('/api/memories')
  }
  
  static get instance() {
    if(!MemoryProvider.singleton){
      MemoryProvider.singleton = new MemoryProvider()
    }
    return MemoryProvider.singleton
  }

}

export default MemoryProvider

