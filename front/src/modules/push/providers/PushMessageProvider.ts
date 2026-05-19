
import {AbstractCrudRestProvider} from "@drax/crud-front";
import {HttpRestClientFactory, IHttpClient} from "@drax/common-front";
import type {IPushMessage, IPushMessageBase} from '../interfaces/IPushMessage'

interface IPushMessageTestInput {
  pushDeviceId: string
  title: string
  body: string
  type?: string
}

class PushMessageProvider extends AbstractCrudRestProvider<IPushMessage, IPushMessageBase, IPushMessageBase> {
    
  static singleton: PushMessageProvider
  httpClient: IHttpClient
    
  constructor() {
   super('/api/push-messages')
   this.httpClient = HttpRestClientFactory.getInstance()
  }
  
  static get instance() {
    if(!PushMessageProvider.singleton){
      PushMessageProvider.singleton = new PushMessageProvider()
    }
    return PushMessageProvider.singleton
  }

  async sendTest(input: IPushMessageTestInput): Promise<IPushMessage> {
    return await this.httpClient.post('/api/push-messages/test', input) as IPushMessage
  }

}

export type {IPushMessageTestInput}
export default PushMessageProvider
