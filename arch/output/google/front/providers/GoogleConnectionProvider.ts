
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IGoogleConnection, IGoogleConnectionBase} from '../interfaces/IGoogleConnection'

class GoogleConnectionProvider extends AbstractCrudRestProvider<IGoogleConnection, IGoogleConnectionBase, IGoogleConnectionBase> {
    
  static singleton: GoogleConnectionProvider
    
  constructor() {
   super('/api/google-connections')
  }
  
  static get instance() {
    if(!GoogleConnectionProvider.singleton){
      GoogleConnectionProvider.singleton = new GoogleConnectionProvider()
    }
    return GoogleConnectionProvider.singleton
  }

}

export default GoogleConnectionProvider

