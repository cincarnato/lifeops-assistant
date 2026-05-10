
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IClient, IClientBase} from '../interfaces/IClient'

class ClientProvider extends AbstractCrudRestProvider<IClient, IClientBase, IClientBase> {
    
  static singleton: ClientProvider
    
  constructor() {
   super('/api/clients')
  }
  
  static get instance() {
    if(!ClientProvider.singleton){
      ClientProvider.singleton = new ClientProvider()
    }
    return ClientProvider.singleton
  }

}

export default ClientProvider

