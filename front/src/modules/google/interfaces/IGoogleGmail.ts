interface IGoogleGmailMessageAddress {
  name?: string
  email: string
}

interface IGoogleGmailAttachment {
  id?: string
  filename: string
  mimeType: string
  size: number
}

interface IGoogleGmailMessageSummary {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  historyId?: string
  internalDate?: string
  subject: string
  from?: IGoogleGmailMessageAddress
  to: IGoogleGmailMessageAddress[]
  date?: string
  unread: boolean
  starred: boolean
  hasAttachments: boolean
}

interface IGoogleGmailMessage extends IGoogleGmailMessageSummary {
  cc: IGoogleGmailMessageAddress[]
  bcc: IGoogleGmailMessageAddress[]
  bodyText: string
  bodyHtml: string
  attachments: IGoogleGmailAttachment[]
}

interface IGoogleGmailListOptions {
  connectionId?: string
  limit?: number
  pageToken?: string
  search?: string
  labelIds?: string[]
  from?: string
  to?: string
  subject?: string
  after?: string
  before?: string
  unread?: boolean
  hasAttachment?: boolean
}

interface IGoogleGmailListResult {
  items: IGoogleGmailMessageSummary[]
  nextPageToken?: string
  resultSizeEstimate: number
}

export type {
  IGoogleGmailAttachment,
  IGoogleGmailListOptions,
  IGoogleGmailListResult,
  IGoogleGmailMessage,
  IGoogleGmailMessageAddress,
  IGoogleGmailMessageSummary,
}
