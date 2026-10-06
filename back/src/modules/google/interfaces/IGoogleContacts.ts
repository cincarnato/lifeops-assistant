type GoogleContactField = {
    value?: string;
    type?: string;
    formattedType?: string;
    displayName?: string;
    canonicalForm?: string;
    primary?: boolean;
}

type GoogleContactName = {
    displayName?: string;
    givenName?: string;
    familyName?: string;
    primary?: boolean;
}

type GoogleContactOrganization = {
    name?: string;
    title?: string;
    department?: string;
    domain?: string;
    type?: string;
    current?: boolean;
}

type GoogleContactAddress = {
    formattedValue?: string;
    streetAddress?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
    type?: string;
    primary?: boolean;
}

type GoogleContactBirthday = {
    year?: number;
    month?: number;
    day?: number;
}

type GoogleContactMetadata = {
    sources?: Array<{
        type?: string;
        id?: string;
        etag?: string;
    }>;
}

type GoogleContact = {
    resourceName: string;
    etag?: string;
    metadata?: GoogleContactMetadata;
    names: GoogleContactName[];
    emailAddresses: GoogleContactField[];
    phoneNumbers: GoogleContactField[];
    organizations: GoogleContactOrganization[];
    addresses: GoogleContactAddress[];
    urls: GoogleContactField[];
    biographies: string[];
    photos: GoogleContactField[];
    nicknames: GoogleContactField[];
    birthdays: GoogleContactBirthday[];
    raw?: unknown;
}

type GoogleContactsListOptions = {
    userId: string;
    connectionId?: string;
    limit?: number;
    pageToken?: string;
    personFields?: string[];
    sortOrder?: "LAST_MODIFIED_ASCENDING" | "LAST_MODIFIED_DESCENDING" | "FIRST_NAME_ASCENDING" | "LAST_NAME_ASCENDING";
}

type GoogleContactsListResult = {
    items: GoogleContact[];
    nextPageToken?: string;
    totalItems?: number;
}

type GoogleContactsCreateInput = {
    givenName?: string;
    familyName?: string;
    nickname?: string;
    emailAddresses?: GoogleContactField[];
    phoneNumbers?: GoogleContactField[];
    organizations?: GoogleContactOrganization[];
    addresses?: GoogleContactAddress[];
    urls?: GoogleContactField[];
    birthday?: GoogleContactBirthday;
    biography?: string;
}

type GoogleContactsCreateOptions = {
    userId: string;
    connectionId?: string;
    contact: GoogleContactsCreateInput;
}

type GoogleContactsUpdateOptions = {
    userId: string;
    connectionId?: string;
    resourceName: string;
    etag?: string;
    metadata?: GoogleContactMetadata;
    contact: GoogleContactsCreateInput;
}

type GoogleContactsUpdatePhotoOptions = {
    userId: string;
    connectionId?: string;
    resourceName: string;
    photoBytes: string;
}

type GoogleContactsSyncOptions = {
    userId: string;
    connectionId?: string;
    limit?: number;
    updateExisting?: boolean;
}

type GoogleContactsSyncItem = {
    resourceName: string;
    contactId?: string;
    displayName: string;
    emails: string[];
    phones: string[];
    action: "created" | "updated" | "skipped";
    reason?: string;
}

type GoogleContactsSyncResult = {
    totalGoogleContacts: number;
    created: number;
    updated: number;
    skipped: number;
    items: GoogleContactsSyncItem[];
}

export type {
    GoogleContact,
    GoogleContactAddress,
    GoogleContactBirthday,
    GoogleContactField,
    GoogleContactName,
    GoogleContactMetadata,
    GoogleContactOrganization,
    GoogleContactsCreateInput,
    GoogleContactsCreateOptions,
    GoogleContactsUpdateOptions,
    GoogleContactsUpdatePhotoOptions,
    GoogleContactsListOptions,
    GoogleContactsListResult,
    GoogleContactsSyncItem,
    GoogleContactsSyncOptions,
    GoogleContactsSyncResult,
}
