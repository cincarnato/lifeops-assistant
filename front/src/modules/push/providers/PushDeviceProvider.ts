
import {AbstractCrudRestProvider} from "@drax/crud-front";
import {HttpRestClientFactory, IHttpClient} from "@drax/common-front";
import type {IPushDevice, IPushDeviceBase} from '../interfaces/IPushDevice'

interface IPushDeviceRegisterInput {
  platform: 'android' | 'ios' | 'web'
  token: string
  deviceName?: string
  guestLabel?: string
  enabled?: boolean
}

class PushDeviceProvider extends AbstractCrudRestProvider<IPushDevice, IPushDeviceBase, IPushDeviceBase> {
    
  static singleton: PushDeviceProvider
  httpClient: IHttpClient
    
  constructor() {
   super('/api/push-devices')
   this.httpClient = HttpRestClientFactory.getInstance()
  }
  
  static get instance() {
    if(!PushDeviceProvider.singleton){
      PushDeviceProvider.singleton = new PushDeviceProvider()
    }
    return PushDeviceProvider.singleton
  }

  async register(input: IPushDeviceRegisterInput): Promise<IPushDevice> {
    return await this.httpClient.post('/api/push-devices/register', input) as IPushDevice
  }

}

export type {IPushDeviceRegisterInput}
export default PushDeviceProvider
