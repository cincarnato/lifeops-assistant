import {HttpRestClientFactory, IHttpClient} from "@drax/common-front";
import {useAuth} from "@drax/identity-vue";
import type {
  IGoogleGmailListOptions,
  IGoogleGmailListResult,
  IGoogleGmailMessage,
} from "@/modules/google/interfaces/IGoogleGmail";
import type {
  IGoogleCalendarCreateEventInput,
  IGoogleCalendarEvent,
  IGoogleCalendarEventsListOptions,
  IGoogleCalendarEventsListResult,
  IGoogleCalendarItem,
  IGoogleCalendarListOptions,
} from "@/modules/google/interfaces/IGoogleCalendar";
import type {
  IGoogleContactsListOptions,
  IGoogleContactsListResult,
  IGoogleContactsSyncInput,
  IGoogleContactsSyncResult,
} from "@/modules/google/interfaces/IGoogleContacts";


class GoogleProvider {

  static singleton: GoogleProvider

  httpClient: IHttpClient
  basePath: string = '/api/google'

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  setHttpClientToken(token: string): void {
    this.httpClient.addHeader('Authorization', `Bearer ${token}`)
  }

  removeHttpClientToken(): void {
    this.httpClient.removeHeader('Authorization')
  }

  static get instance() {
    if(!GoogleProvider.singleton){
      GoogleProvider.singleton = new GoogleProvider()
    }
    return GoogleProvider.singleton
  }

  async login(credential: string): Promise<{accessToken: string}> {
    const url = this.basePath + '/login'
    const response:{accessToken: string} = await this.httpClient.post(url, {credential}, {timeout: 120000}) as {accessToken: string}
    const {loginWithToken} = useAuth()
    this.setHttpClientToken(response.accessToken)
    await loginWithToken(response.accessToken)
    return response
  }

  async logout(): Promise<object|string> {
    const url = this.basePath + '/logout'
    const response = await this.httpClient.post(url, {}, {timeout: 120000})
    return response
  }

  async getConnectionPermissions(): Promise<{permissions: Array<{key: string, label: string, scope: string}>}> {
    const url = this.basePath + '/connections/permissions'
    return await this.httpClient.get(url, {timeout: 120000}) as {permissions: Array<{key: string, label: string, scope: string}>}
  }

  async getMyConnections(): Promise<{connections: any[]}> {
    const url = this.basePath + '/connections/me'
    return await this.httpClient.get(url, {timeout: 120000}) as {connections: any[]}
  }

  async createConnectionAuthorizationUrl(payload: {
    permissions: string[],
    scopes?: string[],
    redirectUri: string,
    state?: string,
  }): Promise<{authorizationUrl: string}> {
    const url = this.basePath + '/connections/auth-url'
    return await this.httpClient.post(url, payload, {timeout: 120000}) as {authorizationUrl: string}
  }

  async completeConnectionCallback(payload: {
    code: string,
    redirectUri: string,
  }): Promise<{connection: any}> {
    const url = this.basePath + '/connections/callback'
    return await this.httpClient.post(url, payload, {timeout: 120000}) as {connection: any}
  }

  async listGmailMessages(options: IGoogleGmailListOptions = {}): Promise<IGoogleGmailListResult> {
    const params = new URLSearchParams()
    Object.entries(options).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      if (Array.isArray(value)) {
        value.forEach(item => params.append(key, String(item)))
        return
      }
      params.set(key, String(value))
    })

    const query = params.toString()
    const url = `${this.basePath}/gmail/messages${query ? `?${query}` : ''}`
    return await this.httpClient.get(url, {timeout: 120000}) as IGoogleGmailListResult
  }

  async getGmailMessage(id: string, connectionId?: string): Promise<IGoogleGmailMessage> {
    const params = new URLSearchParams()
    if (connectionId) params.set('connectionId', connectionId)
    const query = params.toString()
    const url = `${this.basePath}/gmail/messages/${encodeURIComponent(id)}${query ? `?${query}` : ''}`
    return await this.httpClient.get(url, {timeout: 120000}) as IGoogleGmailMessage
  }

  async listCalendars(options: IGoogleCalendarListOptions = {}): Promise<{items: IGoogleCalendarItem[]}> {
    const params = this.createQueryParams(options)
    const query = params.toString()
    const url = `${this.basePath}/calendar/calendars${query ? `?${query}` : ''}`
    return await this.httpClient.get(url, {timeout: 120000}) as {items: IGoogleCalendarItem[]}
  }

  async listCalendarEvents(options: IGoogleCalendarEventsListOptions): Promise<IGoogleCalendarEventsListResult> {
    const params = this.createQueryParams(options)
    const query = params.toString()
    const url = `${this.basePath}/calendar/events${query ? `?${query}` : ''}`
    return await this.httpClient.get(url, {timeout: 120000}) as IGoogleCalendarEventsListResult
  }

  async createCalendarEvent(payload: IGoogleCalendarCreateEventInput): Promise<IGoogleCalendarEvent> {
    const url = `${this.basePath}/calendar/events`
    return await this.httpClient.post(url, payload, {timeout: 120000}) as IGoogleCalendarEvent
  }

  async listContacts(options: IGoogleContactsListOptions = {}): Promise<IGoogleContactsListResult> {
    const params = this.createQueryParams(options)
    const query = params.toString()
    const url = `${this.basePath}/contacts${query ? `?${query}` : ''}`
    return await this.httpClient.get(url, {timeout: 120000}) as IGoogleContactsListResult
  }

  async syncContacts(payload: IGoogleContactsSyncInput): Promise<IGoogleContactsSyncResult> {
    const url = `${this.basePath}/contacts/sync`
    return await this.httpClient.post(url, payload, {timeout: 120000}) as IGoogleContactsSyncResult
  }

  private createQueryParams(options: Record<string, any>): URLSearchParams {
    const params = new URLSearchParams()
    Object.entries(options).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      if (Array.isArray(value)) {
        value.forEach(item => params.append(key, String(item)))
        return
      }
      params.set(key, String(value))
    })
    return params
  }

}

export default GoogleProvider
