interface IGoogleContactField {
  value?: string
  type?: string
  formattedType?: string
}

interface IGoogleContactName {
  displayName?: string
  givenName?: string
  familyName?: string
  middleName?: string
}

interface IGoogleContactOrganization {
  name?: string
  title?: string
  department?: string
}

interface IGoogleContact {
  resourceName: string
  etag?: string
  names: IGoogleContactName[]
  emailAddresses: IGoogleContactField[]
  phoneNumbers: IGoogleContactField[]
  organizations: IGoogleContactOrganization[]
  biographies: string[]
  photos: IGoogleContactField[]
}

interface IGoogleContactsListOptions {
  connectionId?: string
  limit?: number
  pageToken?: string
  personFields?: string[]
  sortOrder?: string
}

interface IGoogleContactsListResult {
  items: IGoogleContact[]
  nextPageToken?: string
  totalItems?: number
}

interface IGoogleContactsSyncInput {
  connectionId?: string
  limit?: number
  updateExisting?: boolean
}

interface IGoogleContactsSyncItem {
  resourceName: string
  contactId?: string
  displayName: string
  emails: string[]
  phones: string[]
  action: 'created' | 'updated' | 'skipped'
  reason?: string
}

interface IGoogleContactsSyncResult {
  totalGoogleContacts: number
  created: number
  updated: number
  skipped: number
  items: IGoogleContactsSyncItem[]
}

export type {
  IGoogleContact,
  IGoogleContactField,
  IGoogleContactName,
  IGoogleContactOrganization,
  IGoogleContactsListOptions,
  IGoogleContactsListResult,
  IGoogleContactsSyncInput,
  IGoogleContactsSyncItem,
  IGoogleContactsSyncResult,
}
