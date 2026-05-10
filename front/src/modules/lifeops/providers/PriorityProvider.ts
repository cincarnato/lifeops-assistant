
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IPriority, IPriorityBase} from '../interfaces/IPriority'

class PriorityProvider extends AbstractCrudRestProvider<IPriority, IPriorityBase, IPriorityBase> {
    
  static singleton: PriorityProvider
    
  constructor() {
   super('/api/priorities')
  }
  
  static get instance() {
    if(!PriorityProvider.singleton){
      PriorityProvider.singleton = new PriorityProvider()
    }
    return PriorityProvider.singleton
  }

}

export default PriorityProvider

