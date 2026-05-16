
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IPurpose, IPurposeBase} from '../interfaces/IPurpose'

class PurposeProvider extends AbstractCrudRestProvider<IPurpose, IPurposeBase, IPurposeBase> {
    
  static singleton: PurposeProvider
    
  constructor() {
   super('/api/purposes')
  }
  
  static get instance() {
    if(!PurposeProvider.singleton){
      PurposeProvider.singleton = new PurposeProvider()
    }
    return PurposeProvider.singleton
  }

}

export default PurposeProvider

