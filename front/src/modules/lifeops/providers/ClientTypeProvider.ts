
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IClientType, IClientTypeBase} from '../interfaces/IClientType'

class ClientTypeProvider extends AbstractCrudRestProvider<IClientType, IClientTypeBase, IClientTypeBase> {
    
  static singleton: ClientTypeProvider
    
  constructor() {
   super('/api/client-types')
  }
  
  static get instance() {
    if(!ClientTypeProvider.singleton){
      ClientTypeProvider.singleton = new ClientTypeProvider()
    }
    return ClientTypeProvider.singleton
  }

}

export default ClientTypeProvider

