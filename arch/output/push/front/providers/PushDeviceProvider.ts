
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IPushDevice, IPushDeviceBase} from '../interfaces/IPushDevice'

class PushDeviceProvider extends AbstractCrudRestProvider<IPushDevice, IPushDeviceBase, IPushDeviceBase> {
    
  static singleton: PushDeviceProvider
    
  constructor() {
   super('/api/push-devices')
  }
  
  static get instance() {
    if(!PushDeviceProvider.singleton){
      PushDeviceProvider.singleton = new PushDeviceProvider()
    }
    return PushDeviceProvider.singleton
  }

}

export default PushDeviceProvider

