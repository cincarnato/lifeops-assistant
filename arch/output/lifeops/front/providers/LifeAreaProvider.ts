
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ILifeArea, ILifeAreaBase} from '../interfaces/ILifeArea'

class LifeAreaProvider extends AbstractCrudRestProvider<ILifeArea, ILifeAreaBase, ILifeAreaBase> {
    
  static singleton: LifeAreaProvider
    
  constructor() {
   super('/api/life-areas')
  }
  
  static get instance() {
    if(!LifeAreaProvider.singleton){
      LifeAreaProvider.singleton = new LifeAreaProvider()
    }
    return LifeAreaProvider.singleton
  }

}

export default LifeAreaProvider

