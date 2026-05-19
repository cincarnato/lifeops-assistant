import {OAuth2Client} from "google-auth-library";
import GoogleConnectionServiceFactory from "../factory/services/GoogleConnectionServiceFactory.js";
import ContactServiceFactory from "../../lifeops/factory/services/ContactServiceFactory.js";
import type {IGoogleConnection} from "../interfaces/IGoogleConnection";
import type {
    IContact,
    IContactAddress,
    IContactBase,
    IContactEmail,
    IContactPhone,
} from "../../lifeops/interfaces/IContact";
import type {
    GoogleContact,
    GoogleContactAddress,
    GoogleContactField,
    GoogleContactsCreateOptions,
    GoogleContactsListOptions,
    GoogleContactsListResult,
    GoogleContactsSyncItem,
    GoogleContactsSyncOptions,
    GoogleContactsSyncResult,
} from "../interfaces/IGoogleContacts";

const CONTACTS_READONLY_SCOPE = "https://www.googleapis.com/auth/contacts.readonly";
const CONTACTS_SCOPE = "https://www.googleapis.com/auth/contacts";
const DEFAULT_PERSON_FIELDS = [
    "names",
    "emailAddresses",
    "phoneNumbers",
    "organizations",
    "addresses",
    "urls",
    "biographies",
    "photos",
    "nicknames",
    "birthdays",
    "metadata",
];

class GoogleContactsService {

    async listContacts(options: GoogleContactsListOptions): Promise<GoogleContactsListResult> {
        const connection = await this.resolveConnection(options.userId, options.connectionId, false);
        const accessToken = await this.getAccessToken(connection);
        const params = new URLSearchParams({
            pageSize: String(Math.min(Math.max(Number(options.limit) || 25, 1), 100)),
            personFields: this.resolvePersonFields(options.personFields),
        });

        if (options.pageToken) {
            params.set("pageToken", options.pageToken);
        }
        if (options.sortOrder) {
            params.set("sortOrder", options.sortOrder);
        }

        const response = await this.peopleFetch<{
            connections?: any[];
            nextPageToken?: string;
            totalItems?: number;
        }>(`https://people.googleapis.com/v1/people/me/connections?${params.toString()}`, accessToken);

        return {
            items: (response.connections || []).map(contact => this.mapContact(contact)),
            nextPageToken: response.nextPageToken,
            totalItems: response.totalItems,
        };
    }

    async createContact(options: GoogleContactsCreateOptions): Promise<GoogleContact> {
        const connection = await this.resolveConnection(options.userId, options.connectionId, true);
        const accessToken = await this.getAccessToken(connection);
        const body = this.buildCreateContactBody(options.contact);

        const response = await this.peopleFetch<any>(
            `https://people.googleapis.com/v1/people:createContact?${new URLSearchParams({
                personFields: this.resolvePersonFields(),
            }).toString()}`,
            accessToken,
            {
                method: "POST",
                body: JSON.stringify(body),
            }
        );

        return this.mapContact(response);
    }

    async syncContacts(options: GoogleContactsSyncOptions): Promise<GoogleContactsSyncResult> {
        const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 1000);
        const updateExisting = options.updateExisting !== false;
        const connection = await this.resolveConnection(options.userId, options.connectionId, false);
        const googleContacts = await this.fetchContactsForSync({
            userId: options.userId,
            connectionId: connection._id,
            limit,
        });
        const contactService = ContactServiceFactory.instance;
        const existingContacts = await contactService.find({
            filters: [{field: "user", operator: "eq", value: options.userId}],
            limit: 0,
        });
        const indexes = this.buildContactIndexes(existingContacts);

        const result: GoogleContactsSyncResult = {
            totalGoogleContacts: googleContacts.length,
            created: 0,
            updated: 0,
            skipped: 0,
            items: [],
        };

        for (const googleContact of googleContacts) {
            const mapped = this.mapGoogleContactToLifeOpsContact(googleContact, options.userId);
            if (!mapped) {
                result.skipped += 1;
                result.items.push(this.buildSyncItem(googleContact, "skipped", undefined, "google.contacts.empty"));
                continue;
            }

            const existing = this.findMatchingContact(mapped, indexes);
            if (!existing) {
                const created = await contactService.create(mapped);
                this.addToIndexes(created, indexes);
                result.created += 1;
                result.items.push(this.buildSyncItem(googleContact, "created", created._id));
                continue;
            }

            if (!updateExisting) {
                result.skipped += 1;
                result.items.push(this.buildSyncItem(googleContact, "skipped", existing._id, "google.contacts.existing"));
                continue;
            }

            const updated = await contactService.updatePartial(existing._id, this.mergeGoogleContact(existing, mapped));
            this.addToIndexes(updated, indexes);
            result.updated += 1;
            result.items.push(this.buildSyncItem(googleContact, "updated", updated._id));
        }

        return result;
    }

    private async resolveConnection(userId: string, connectionId?: string, requireWrite = false): Promise<IGoogleConnection> {
        const service = GoogleConnectionServiceFactory.instance;
        const connection = connectionId
            ? await service.findById(connectionId)
            : (await service.findBy("userId", userId, 20)).find(item => requireWrite ? this.canWriteContacts(item) : this.canReadContacts(item));

        if (!connection || this.getConnectionUserId(connection) !== userId) {
            throw new Error("google.connection.not_found");
        }

        if (requireWrite && !this.canWriteContacts(connection)) {
            throw new Error("google.contacts.write_scope.required");
        }

        if (!requireWrite && !this.canReadContacts(connection)) {
            throw new Error("google.contacts.scope.required");
        }

        return connection;
    }

    private canReadContacts(connection: IGoogleConnection): boolean {
        return connection.status === "active" && (
            connection.scope?.includes(CONTACTS_READONLY_SCOPE) ||
            connection.scope?.includes(CONTACTS_SCOPE)
        );
    }

    private canWriteContacts(connection: IGoogleConnection): boolean {
        return connection.status === "active" && connection.scope?.includes(CONTACTS_SCOPE);
    }

    private getConnectionUserId(connection: IGoogleConnection): string {
        const userId = connection.userId;
        if (typeof userId === "string") {
            return userId;
        }
        return userId?._id?.toString?.() || userId?.id?.toString?.() || "";
    }

    private async fetchContactsForSync(options: {userId: string; connectionId: string; limit: number}): Promise<GoogleContact[]> {
        const contacts: GoogleContact[] = [];
        let pageToken: string | undefined;

        while (contacts.length < options.limit) {
            const response = await this.listContacts({
                userId: options.userId,
                connectionId: options.connectionId,
                limit: Math.min(100, options.limit - contacts.length),
                pageToken,
                sortOrder: "FIRST_NAME_ASCENDING",
            });
            contacts.push(...response.items);
            pageToken = response.nextPageToken;
            if (!pageToken || response.items.length === 0) {
                break;
            }
        }

        return contacts;
    }

    private buildContactIndexes(contacts: IContact[]) {
        const indexes = {
            byExternalId: new Map<string, IContact>(),
            byEmail: new Map<string, IContact>(),
            byPhone: new Map<string, IContact>(),
        };

        contacts.forEach(contact => this.addToIndexes(contact, indexes));
        return indexes;
    }

    private addToIndexes(contact: IContact, indexes: ReturnType<GoogleContactsService["buildContactIndexes"]>) {
        if (contact.externalId) {
            indexes.byExternalId.set(contact.externalId, contact);
        }
        (contact.emails || []).forEach(email => indexes.byEmail.set(this.normalizeEmail(email.value), contact));
        (contact.phones || []).forEach(phone => indexes.byPhone.set(this.normalizePhone(phone.value), contact));
    }

    private findMatchingContact(data: IContactBase, indexes: ReturnType<GoogleContactsService["buildContactIndexes"]>): IContact | undefined {
        if (data.externalId && indexes.byExternalId.has(data.externalId)) {
            return indexes.byExternalId.get(data.externalId);
        }

        const emailMatch = (data.emails || [])
            .map(email => indexes.byEmail.get(this.normalizeEmail(email.value)))
            .find(Boolean);
        if (emailMatch) {
            return emailMatch;
        }

        return (data.phones || [])
            .map(phone => indexes.byPhone.get(this.normalizePhone(phone.value)))
            .find(Boolean);
    }

    private mapGoogleContactToLifeOpsContact(contact: GoogleContact, userId: string): IContactBase | null {
        const primaryName = contact.names?.[0] || {};
        const organization = contact.organizations?.[0] || {};
        const emails = this.mapContactEmails(contact.emailAddresses);
        const phones = this.mapContactPhones(contact.phoneNumbers);
        const displayName = this.resolveDisplayName(contact, emails.map(email => email.value), phones.map(phone => phone.value));

        if (!displayName && emails.length === 0 && phones.length === 0) {
            return null;
        }

        return {
            source: "google",
            externalProvider: "google",
            externalId: contact.resourceName,
            externalEtag: contact.etag || "",
            externalRaw: contact.raw,
            displayName: displayName || primaryName.givenName || emails[0]?.value?.split("@")[0] || phones[0]?.value || "Contacto",
            givenName: primaryName.givenName || this.firstWord(displayName) || "",
            familyName: primaryName.familyName || this.remainingWords(displayName),
            nickname: contact.nicknames?.[0]?.value || "",
            emails,
            phones,
            organization: {
                name: organization.name || "",
                title: organization.title || "",
                department: organization.department || "",
                domain: "",
            },
            addresses: this.mapContactAddresses(contact.addresses),
            photoUrl: contact.photos?.[0]?.value || "",
            birthday: contact.birthdays?.[0],
            tags: ["google"],
            status: "active",
            notes: contact.biographies?.join("\n") || "",
            lastSyncedAt: new Date(),
            user: userId,
        };
    }

    private mergeGoogleContact(existing: IContact, incoming: IContactBase): Partial<IContactBase> {
        return {
            source: existing.source || incoming.source || "google",
            externalProvider: incoming.externalProvider,
            externalId: incoming.externalId,
            externalEtag: incoming.externalEtag,
            externalRaw: incoming.externalRaw,
            displayName: existing.displayName || incoming.displayName,
            givenName: existing.givenName || incoming.givenName || "",
            familyName: existing.familyName || incoming.familyName || "",
            nickname: existing.nickname || incoming.nickname || "",
            emails: this.mergeContactEmails(existing.emails || [], incoming.emails || []),
            phones: this.mergeContactPhones(existing.phones || [], incoming.phones || []),
            organization: incoming.organization || existing.organization || {},
            addresses: incoming.addresses || existing.addresses || [],
            photoUrl: incoming.photoUrl || existing.photoUrl || "",
            birthday: incoming.birthday || existing.birthday,
            tags: this.uniqueValues([...(existing.tags || []), "google"]),
            status: existing.status || "active",
            notes: existing.notes || incoming.notes || "",
            lastSyncedAt: incoming.lastSyncedAt,
        };
    }

    private buildSyncItem(contact: GoogleContact, action: GoogleContactsSyncItem["action"], contactId?: string, reason?: string): GoogleContactsSyncItem {
        return {
            resourceName: contact.resourceName,
            contactId,
            displayName: this.resolveDisplayName(contact, [], []) || contact.resourceName,
            emails: this.uniqueValues(contact.emailAddresses?.map(email => email.value), this.normalizeEmail.bind(this)),
            phones: this.uniqueValues(contact.phoneNumbers?.map(phone => phone.value), this.normalizePhone.bind(this)),
            action,
            reason,
        };
    }

    private resolveDisplayName(contact: GoogleContact, emails: string[], phones: string[]): string {
        const name = contact.names?.[0];
        return name?.displayName || [name?.givenName, name?.familyName].filter(Boolean).join(" ") || emails[0] || phones[0] || "";
    }

    private firstWord(value?: string): string {
        return value?.trim().split(/\s+/)[0] || "";
    }

    private remainingWords(value?: string): string {
        const words = value?.trim().split(/\s+/).filter(Boolean) || [];
        return words.length > 1 ? words.slice(1).join(" ") : "";
    }

    private uniqueValues(values: Array<string | undefined> = [], normalizer: (value: string) => string = value => value.trim()): string[] {
        const seen = new Set<string>();
        const result: string[] = [];

        values
            .map(value => value?.trim())
            .filter(Boolean)
            .forEach(value => {
                const key = normalizer(value as string);
                if (!key || seen.has(key)) {
                    return;
                }
                seen.add(key);
                result.push(value as string);
            });

        return result;
    }

    private normalizeEmail(value: string): string {
        return value.trim().toLocaleLowerCase();
    }

    private normalizePhone(value: string): string {
        return value.replace(/[^\d+]/g, "");
    }

    private mapContactEmails(fields: GoogleContactField[] = []): IContactEmail[] {
        return fields
            .filter(field => field.value)
            .map(field => ({
                value: field.value,
                type: field.type || "other",
                primary: Boolean(field.primary),
                displayName: field.formattedType || "",
            }));
    }

    private mapContactPhones(fields: GoogleContactField[] = []): IContactPhone[] {
        return fields
            .filter(field => field.value)
            .map(field => ({
                value: field.value,
                normalizedValue: this.normalizePhone(field.value),
                type: field.type || "other",
                primary: Boolean(field.primary),
            }));
    }

    private mapContactAddresses(addresses: GoogleContactAddress[] = []): IContactAddress[] {
        return addresses
            .filter(address => address.formattedValue || address.streetAddress || address.city || address.region || address.postalCode || address.country)
            .map(address => ({
                formattedValue: address.formattedValue || "",
                type: address.type || "other",
                streetAddress: address.streetAddress || "",
                city: address.city || "",
                region: address.region || "",
                postalCode: address.postalCode || "",
                country: address.country || "",
                countryCode: address.countryCode || "",
                primary: Boolean(address.primary),
            }));
    }

    private mergeContactEmails(existing: IContactEmail[], incoming: IContactEmail[]): IContactEmail[] {
        const byValue = new Map<string, IContactEmail>();
        [...existing, ...incoming].forEach(email => {
            const key = this.normalizeEmail(email.value || "");
            if (key && !byValue.has(key)) {
                byValue.set(key, email);
            }
        });
        return Array.from(byValue.values());
    }

    private mergeContactPhones(existing: IContactPhone[], incoming: IContactPhone[]): IContactPhone[] {
        const byValue = new Map<string, IContactPhone>();
        [...existing, ...incoming].forEach(phone => {
            const key = this.normalizePhone(phone.value || "");
            if (key && !byValue.has(key)) {
                byValue.set(key, phone);
            }
        });
        return Array.from(byValue.values());
    }

    private async getAccessToken(connection: IGoogleConnection): Promise<string> {
        const expiryTime = connection.expiryDate ? new Date(connection.expiryDate).getTime() : 0;
        if (connection.accessToken && expiryTime > Date.now() + 60000) {
            return connection.accessToken;
        }

        const client = new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        });
        client.setCredentials({
            refresh_token: connection.refreshToken,
        });

        const {credentials} = await client.refreshAccessToken();
        const accessToken = credentials.access_token;
        if (!accessToken) {
            throw new Error("google.access_token.required");
        }

        await GoogleConnectionServiceFactory.instance.updatePartial(connection._id, {
            accessToken,
            expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600000),
            lastUsedAt: new Date(),
        } as any);

        return accessToken;
    }

    private async peopleFetch<T>(url: string, accessToken: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`google.contacts.request_failed:${response.status}:${body}`);
        }

        return await response.json() as T;
    }

    private resolvePersonFields(personFields: string[] = DEFAULT_PERSON_FIELDS): string {
        const fields = personFields
            .map(field => field?.trim())
            .filter(Boolean);

        return Array.from(new Set(fields.length ? fields : DEFAULT_PERSON_FIELDS)).join(",");
    }

    private buildCreateContactBody(contact: GoogleContactsCreateOptions["contact"]): any {
        const hasName = contact.displayName || contact.givenName || contact.familyName || contact.middleName;
        const hasEmail = Boolean(contact.emailAddresses?.some(item => item.value));
        const hasPhone = Boolean(contact.phoneNumbers?.some(item => item.value));

        if (!hasName && !hasEmail && !hasPhone) {
            throw new Error("google.contacts.contact.required");
        }

        return {
            names: hasName ? [{
                displayName: contact.displayName,
                givenName: contact.givenName,
                familyName: contact.familyName,
                middleName: contact.middleName,
            }] : undefined,
            emailAddresses: this.mapValueFields(contact.emailAddresses),
            phoneNumbers: this.mapValueFields(contact.phoneNumbers),
            organizations: contact.organizations?.filter(item => item.name || item.title || item.department),
            addresses: contact.addresses?.filter(item => item.formattedValue || item.streetAddress || item.city || item.region || item.postalCode || item.country),
            urls: this.mapValueFields(contact.urls),
            biographies: contact.biography ? [{
                value: contact.biography,
                contentType: "TEXT_PLAIN",
            }] : undefined,
        };
    }

    private mapValueFields(fields?: Array<{value?: string; type?: string}>): Array<{value?: string; type?: string}> | undefined {
        const mapped = fields
            ?.filter(field => field.value)
            .map(field => ({
                value: field.value,
                type: field.type,
            }));

        return mapped?.length ? mapped : undefined;
    }

    private mapContact(contact: any): GoogleContact {
        return {
            resourceName: contact.resourceName,
            etag: contact.etag,
            names: (contact.names || []).map((name: any) => ({
                displayName: name.displayName,
                givenName: name.givenName,
                familyName: name.familyName,
                middleName: name.middleName,
            })),
            emailAddresses: (contact.emailAddresses || []).map((email: any) => ({
                value: email.value,
                type: email.type,
                formattedType: email.formattedType,
                primary: Boolean(email.metadata?.primary),
            })),
            phoneNumbers: (contact.phoneNumbers || []).map((phone: any) => ({
                value: phone.value,
                type: phone.type,
                formattedType: phone.formattedType,
                primary: Boolean(phone.metadata?.primary),
            })),
            organizations: (contact.organizations || []).map((organization: any) => ({
                name: organization.name,
                title: organization.title,
                department: organization.department,
            })),
            addresses: (contact.addresses || []).map((address: any) => ({
                formattedValue: address.formattedValue,
                streetAddress: address.streetAddress,
                city: address.city,
                region: address.region,
                postalCode: address.postalCode,
                country: address.country,
                countryCode: address.countryCode,
                type: address.type,
                primary: Boolean(address.metadata?.primary),
            })),
            urls: (contact.urls || []).map((url: any) => ({
                value: url.value,
                type: url.type,
                formattedType: url.formattedType,
            })),
            biographies: (contact.biographies || []).map((biography: any) => biography.value).filter(Boolean),
            photos: (contact.photos || []).map((photo: any) => ({
                value: photo.url,
                type: photo.default ? "default" : undefined,
                primary: Boolean(photo.metadata?.primary),
            })),
            nicknames: (contact.nicknames || []).map((nickname: any) => ({
                value: nickname.value,
                type: nickname.type,
                primary: Boolean(nickname.metadata?.primary),
            })),
            birthdays: (contact.birthdays || []).map((birthday: any) => ({
                year: birthday.date?.year,
                month: birthday.date?.month,
                day: birthday.date?.day,
            })),
            raw: contact,
        };
    }
}

export default GoogleContactsService;
export {GoogleContactsService};
