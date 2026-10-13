import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IDelegate, IDelegateBase} from '../interfaces/IDelegate'

class DelegateProvider extends AbstractCrudRestProvider<IDelegate, IDelegateBase, IDelegateBase> {

  static singleton: DelegateProvider

  constructor() {
   super('/api/delegates')
  }

  static get instance() {
    if(!DelegateProvider.singleton){
      DelegateProvider.singleton = new DelegateProvider()
    }
    return DelegateProvider.singleton
  }

}

export default DelegateProvider
