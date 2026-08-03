
import {AbstractCrudRestProvider} from "@drax/crud-front";
import {HttpRestClientFactory, IHttpClient} from "@drax/common-front";
import type {IPushMessage, IPushMessageBase} from '../interfaces/IPushMessage'

interface IPushMessageTestInput {
  pushDeviceId: string
  title: string
  body: string
  type?: string
}

interface IPushBrowserMessageInput {
  targetUserId: string
  title?: string
  body: string
  type?: string
}

interface IPushBrowserMessageResult {
  sent: boolean
  sentCount: number
  failedCount: number
  results: Array<{
    pushDeviceId: string
    status: 'sent' | 'failed'
    pushMessageId?: string
    providerMessageId?: string
    errorMessage?: string
  }>
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

  async sendBrowser(input: IPushBrowserMessageInput): Promise<IPushBrowserMessageResult> {
    return await this.httpClient.post('/api/push-messages/browser', input) as IPushBrowserMessageResult
  }

}

export type {IPushMessageTestInput, IPushBrowserMessageInput, IPushBrowserMessageResult}
export default PushMessageProvider
