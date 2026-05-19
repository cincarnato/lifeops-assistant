type GoogleContactField = {
    value?: string;
    type?: string;
    formattedType?: string;
    primary?: boolean;
}

type GoogleContactName = {
    displayName?: string;
    givenName?: string;
    familyName?: string;
    middleName?: string;
}

type GoogleContactOrganization = {
    name?: string;
    title?: string;
    department?: string;
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

type GoogleContact = {
    resourceName: string;
    etag?: string;
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
    displayName?: string;
    givenName?: string;
    familyName?: string;
    middleName?: string;
    emailAddresses?: GoogleContactField[];
    phoneNumbers?: GoogleContactField[];
    organizations?: GoogleContactOrganization[];
    addresses?: GoogleContactAddress[];
    urls?: GoogleContactField[];
    biography?: string;
}

type GoogleContactsCreateOptions = {
    userId: string;
    connectionId?: string;
    contact: GoogleContactsCreateInput;
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
    GoogleContactOrganization,
    GoogleContactsCreateInput,
    GoogleContactsCreateOptions,
    GoogleContactsListOptions,
    GoogleContactsListResult,
    GoogleContactsSyncItem,
    GoogleContactsSyncOptions,
    GoogleContactsSyncResult,
}
