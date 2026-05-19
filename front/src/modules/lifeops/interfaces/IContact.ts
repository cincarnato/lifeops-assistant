interface IContactEmail {
    value: string
    type?: 'home' | 'work' | 'other' | string
    primary?: boolean
    displayName?: string
}

interface IContactPhone {
    value: string
    normalizedValue?: string
    type?: 'home' | 'work' | 'mobile' | 'other' | string
    primary?: boolean
}

interface IContactAddress {
    formattedValue?: string
    type?: 'home' | 'work' | 'other' | string
    streetAddress?: string
    city?: string
    region?: string
    postalCode?: string
    country?: string
    countryCode?: string
    primary?: boolean
}

interface IContactOrganization {
    name?: string
    title?: string
    department?: string
    domain?: string
}

interface IContactBirthday {
    year?: number
    month?: number
    day?: number
}

interface IContactBase {
    source: 'manual' | 'google' | 'imported' | 'api'
    externalProvider?: 'google'
    externalId?: string
    externalEtag?: string
    externalRaw?: unknown
    displayName: string
    givenName?: string
    familyName?: string
    nickname?: string
    emails?: IContactEmail[]
    phones?: IContactPhone[]
    organization?: IContactOrganization
    addresses?: IContactAddress[]
    photoUrl?: string
    birthday?: IContactBirthday
    notes?: string
    tags?: string[]
    status?: 'active' | 'archived' | 'deleted'
    lastSyncedAt?: Date
    user: any
    createdAt?: Date
    updatedAt?: Date
}

interface IContact extends IContactBase {
    _id: string
}

export type {
    IContactAddress,
    IContactBase,
    IContactBirthday,
    IContactEmail,
    IContactOrganization,
    IContactPhone,
    IContact,
}
