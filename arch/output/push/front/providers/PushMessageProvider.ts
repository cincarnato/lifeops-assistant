
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IPushMessage, IPushMessageBase} from '../interfaces/IPushMessage'

class PushMessageProvider extends AbstractCrudRestProvider<IPushMessage, IPushMessageBase, IPushMessageBase> {
    
  static singleton: PushMessageProvider
    
  constructor() {
   super('/api/push-messages')
  }
  
  static get instance() {
    if(!PushMessageProvider.singleton){
      PushMessageProvider.singleton = new PushMessageProvider()
    }
    return PushMessageProvider.singleton
  }

}

export default PushMessageProvider

