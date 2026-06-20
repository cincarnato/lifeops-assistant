import {HttpRestClientFactory, IHttpClient} from "@drax/common-front";

type DeactivateAccountResult = {
  success: boolean
  googleConnectionsRevoked: number
  googleConnectionsFailed: number
}

class AccountProvider {
  static singleton: AccountProvider

  httpClient: IHttpClient
  basePath: string = '/api/account'

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  static get instance() {
    if (!AccountProvider.singleton) {
      AccountProvider.singleton = new AccountProvider()
    }
    return AccountProvider.singleton
  }

  async deactivateAccount(): Promise<DeactivateAccountResult> {
    return await this.httpClient.post(`${this.basePath}/deactivate`, {}, {timeout: 120000}) as DeactivateAccountResult
  }
}

export default AccountProvider
export type {DeactivateAccountResult}
