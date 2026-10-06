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
    GoogleContactMetadata,
    GoogleContactsCreateOptions,
    GoogleContactsListOptions,
    GoogleContactsListResult,
    GoogleContactsSyncItem,
    GoogleContactsSyncOptions,
    GoogleContactsSyncResult,
    GoogleContactsUpdateOptions,
    GoogleContactsUpdatePhotoOptions,
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
        console.info("google.contacts.create_requested", {
            userId: options.userId,
            connectionId: options.connectionId,
            hasName: Boolean(options.contact.givenName || options.contact.familyName),
            emailCount: options.contact.emailAddresses?.length || 0,
            phoneCount: options.contact.phoneNumbers?.length || 0,
        });

        const connection = await this.resolveConnection(options.userId, options.connectionId, true);
        console.info("google.contacts.create_connection_resolved", {
            userId: options.userId,
            connectionId: connection._id,
            scope: connection.scope,
            status: connection.status,
        });

        const accessToken = await this.getAccessToken(connection);
        const body = this.buildCreateContactBody(options.contact);
        console.info("google.contacts.create_body_built", {
            userId: options.userId,
            connectionId: connection._id,
            hasNames: Boolean(body.names?.length),
            emailCount: body.emailAddresses?.length || 0,
            phoneCount: body.phoneNumbers?.length || 0,
            organizationCount: body.organizations?.length || 0,
            addressCount: body.addresses?.length || 0,
            hasBiography: Boolean(body.biographies?.length),
        });

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

        const googleContact = this.mapContact(response);
        console.info("google.contacts.create_response", {
            userId: options.userId,
            connectionId: connection._id,
            resourceName: googleContact.resourceName,
        });

        return googleContact;
    }

    async createContactFromLifeOps(contact: IContact): Promise<GoogleContact> {
        const userId = this.getContactUserId(contact);
        console.info("google.contacts.create_from_lifeops", {
            contactId: contact._id,
            userId,
            source: contact.source,
            externalProvider: contact.externalProvider,
            hasExternalId: Boolean(contact.externalId),
        });

        const googleContact = await this.createContact({
            userId,
            contact: this.mapLifeOpsContactToGoogleCreateInput(contact),
        });

        return this.syncContactPhotoIfNeeded(contact, googleContact);
    }

    async updateContact(options: GoogleContactsUpdateOptions): Promise<GoogleContact> {
        console.info("google.contacts.update_requested", {
            userId: options.userId,
            connectionId: options.connectionId,
            resourceName: options.resourceName,
            hasName: Boolean(options.contact.givenName || options.contact.familyName),
            emailCount: options.contact.emailAddresses?.length || 0,
            phoneCount: options.contact.phoneNumbers?.length || 0,
        });

        const connection = await this.resolveConnection(options.userId, options.connectionId, true);
        const accessToken = await this.getAccessToken(connection);
        const body = this.buildUpdateContactBody(options);
        const params = new URLSearchParams({
            updatePersonFields: [
                "names",
                "emailAddresses",
                "phoneNumbers",
                "organizations",
                "addresses",
                "biographies",
                "nicknames",
                "birthdays",
            ].join(","),
            personFields: this.resolvePersonFields(),
        });

        const response = await this.peopleFetch<any>(
            `https://people.googleapis.com/v1/${encodeURI(options.resourceName)}:updateContact?${params.toString()}`,
            accessToken,
            {
                method: "PATCH",
                body: JSON.stringify(body),
            }
        );

        const googleContact = this.mapContact(response);
        console.info("google.contacts.update_response", {
            userId: options.userId,
            connectionId: connection._id,
            resourceName: googleContact.resourceName,
        });

        return googleContact;
    }

    async updateContactPhoto(options: GoogleContactsUpdatePhotoOptions): Promise<GoogleContact> {
        const connection = await this.resolveConnection(options.userId, options.connectionId, true);
        const accessToken = await this.getAccessToken(connection);
        const response = await this.peopleFetch<{person?: any}>(
            `https://people.googleapis.com/v1/${encodeURI(options.resourceName)}:updateContactPhoto`,
            accessToken,
            {
                method: "PATCH",
                body: JSON.stringify({
                    photoBytes: options.photoBytes,
                    personFields: this.resolvePersonFields(),
                }),
            }
        );

        if (!response.person) {
            throw new Error("google.contacts.photo.response_missing");
        }

        return this.mapContact(response.person);
    }

    async updateContactFromLifeOps(contact: IContact): Promise<GoogleContact> {
        if (!contact.externalId) {
            throw new Error("google.contacts.external_id.required");
        }

        const userId = this.getContactUserId(contact);
        console.info("google.contacts.update_from_lifeops", {
            contactId: contact._id,
            userId,
            resourceName: contact.externalId,
            externalProvider: contact.externalProvider,
            hasExternalEtag: Boolean(contact.externalEtag),
        });

        const googleContact = await this.updateContact({
            userId,
            resourceName: contact.externalId,
            etag: contact.externalEtag,
            metadata: this.getStoredGoogleMetadata(contact),
            contact: this.mapLifeOpsContactToGoogleCreateInput(contact),
        });

        return this.syncContactPhotoIfNeeded(contact, googleContact);
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
        console.info("google.contacts.resolve_connection_started", {
            userId,
            connectionId,
            requireWrite,
        });

        const service = GoogleConnectionServiceFactory.instance;
        const connection = connectionId
            ? await service.findById(connectionId)
            : (await service.findBy("userId", userId, 20)).find(item => requireWrite ? this.canWriteContacts(item) : this.canReadContacts(item));

        if (!connection || this.getConnectionUserId(connection) !== userId) {
            console.warn("google.contacts.resolve_connection_not_found", {
                userId,
                connectionId,
                requireWrite,
                foundConnection: Boolean(connection),
                foundConnectionUserId: connection ? this.getConnectionUserId(connection) : undefined,
                foundConnectionStatus: connection?.status,
                foundConnectionScope: connection?.scope,
            });
            throw new Error("google.connection.not_found");
        }

        if (requireWrite && !this.canWriteContacts(connection)) {
            console.warn("google.contacts.resolve_connection_missing_write_scope", {
                userId,
                connectionId: connection._id,
                status: connection.status,
                scope: connection.scope,
                requiredScope: CONTACTS_SCOPE,
            });
            throw new Error("google.contacts.write_scope.required");
        }

        if (!requireWrite && !this.canReadContacts(connection)) {
            console.warn("google.contacts.resolve_connection_missing_read_scope", {
                userId,
                connectionId: connection._id,
                status: connection.status,
                scope: connection.scope,
                requiredScopes: [CONTACTS_READONLY_SCOPE, CONTACTS_SCOPE],
            });
            throw new Error("google.contacts.scope.required");
        }

        console.info("google.contacts.resolve_connection_succeeded", {
            userId,
            connectionId: connection._id,
            requireWrite,
            status: connection.status,
            canReadContacts: this.canReadContacts(connection),
            canWriteContacts: this.canWriteContacts(connection),
        });

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
        const primaryName = contact.names?.find(name => name.primary) || contact.names?.[0] || {};
        const organization = contact.organizations?.find(item => item.current) || contact.organizations?.[0] || {};
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
                domain: organization.domain || "",
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
            displayName: incoming.displayName || existing.displayName,
            givenName: incoming.givenName || "",
            familyName: incoming.familyName || "",
            nickname: incoming.nickname || "",
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
        const name = contact.names?.find(item => item.primary) || contact.names?.[0];
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
                displayName: field.displayName || "",
            }));
    }

    private mapContactPhones(fields: GoogleContactField[] = []): IContactPhone[] {
        return fields
            .filter(field => field.value)
            .map(field => ({
                value: field.value,
                normalizedValue: field.canonicalForm || this.normalizePhone(field.value),
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

    private getContactUserId(contact: IContact): string {
        const user = contact.user;
        if (typeof user === "string") {
            return user;
        }
        return user?._id?.toString?.() || user?.id?.toString?.() || "";
    }

    private getStoredGoogleMetadata(contact: IContact): GoogleContactMetadata | undefined {
        const raw = contact.externalRaw;
        if (!raw || typeof raw !== "object" || !("metadata" in raw)) {
            return undefined;
        }

        return (raw as {metadata?: GoogleContactMetadata}).metadata;
    }

    private async syncContactPhotoIfNeeded(contact: IContact, googleContact: GoogleContact): Promise<GoogleContact> {
        const photoBytes = this.extractPhotoBytes(contact.photoUrl);
        if (!photoBytes) {
            return googleContact;
        }

        return this.updateContactPhoto({
            userId: this.getContactUserId(contact),
            resourceName: googleContact.resourceName,
            photoBytes,
        });
    }

    private extractPhotoBytes(photoUrl?: string): string | undefined {
        if (!photoUrl) {
            return undefined;
        }

        const match = photoUrl.match(/^data:image\/(?:jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/i);
        return match?.[1]?.replace(/\s/g, "");
    }

    private mapLifeOpsContactToGoogleCreateInput(contact: IContact): GoogleContactsCreateOptions["contact"] {
        return {
            givenName: contact.givenName,
            familyName: contact.familyName,
            nickname: contact.nickname,
            emailAddresses: this.primaryFirst(contact.emails).map(email => ({
                value: email.value,
                type: email.type,
                displayName: email.displayName,
            })),
            phoneNumbers: this.primaryFirst(contact.phones).map(phone => ({
                value: phone.value,
                type: phone.type,
            })),
            organizations: contact.organization ? [{
                name: contact.organization.name,
                title: contact.organization.title,
                department: contact.organization.department,
                domain: contact.organization.domain,
                type: "work",
                current: true,
            }] : undefined,
            addresses: this.primaryFirst(contact.addresses).map(address => ({
                formattedValue: address.formattedValue,
                streetAddress: address.streetAddress,
                city: address.city,
                region: address.region,
                postalCode: address.postalCode,
                country: address.country,
                countryCode: address.countryCode,
                type: address.type,
            })),
            birthday: contact.birthday,
            biography: contact.notes,
        };
    }

    private primaryFirst<T extends {primary?: boolean}>(items: T[] | undefined): T[] {
        return [...(items || [])].sort((left, right) => Number(Boolean(right.primary)) - Number(Boolean(left.primary)));
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
        return await GoogleConnectionServiceFactory.instance.getValidAccessToken(connection);
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
        const hasName = contact.givenName || contact.familyName;
        const hasEmail = Boolean(contact.emailAddresses?.some(item => item.value));
        const hasPhone = Boolean(contact.phoneNumbers?.some(item => item.value));

        if (!hasName && !hasEmail && !hasPhone) {
            throw new Error("google.contacts.contact.required");
        }

        return {
            names: hasName ? [{
                givenName: contact.givenName,
                familyName: contact.familyName,
            }] : undefined,
            emailAddresses: this.mapValueFields(contact.emailAddresses),
            phoneNumbers: this.mapValueFields(contact.phoneNumbers),
            organizations: contact.organizations?.filter(item => item.name || item.title || item.department),
            addresses: contact.addresses?.filter(item => item.formattedValue || item.streetAddress || item.city || item.region || item.postalCode || item.country),
            urls: this.mapValueFields(contact.urls),
            nicknames: contact.nickname ? [{
                value: contact.nickname,
            }] : undefined,
            birthdays: contact.birthday && (contact.birthday.year || contact.birthday.month || contact.birthday.day) ? [{
                date: {
                    year: contact.birthday.year || undefined,
                    month: contact.birthday.month || undefined,
                    day: contact.birthday.day || undefined,
                },
            }] : undefined,
            biographies: contact.biography ? [{
                value: contact.biography,
                contentType: "TEXT_PLAIN",
            }] : undefined,
        };
    }

    private buildUpdateContactBody(options: GoogleContactsUpdateOptions): any {
        const body = this.buildCreateContactBody(options.contact);
        return {
            ...body,
            resourceName: options.resourceName,
            etag: options.etag,
            metadata: options.metadata,
        };
    }

    private mapValueFields(fields?: Array<{value?: string; type?: string; displayName?: string}>): Array<{value?: string; type?: string; displayName?: string}> | undefined {
        const mapped = fields
            ?.filter(field => field.value)
            .map(field => ({
                value: field.value,
                type: field.type,
                displayName: field.displayName,
            }));

        return mapped?.length ? mapped : undefined;
    }

    private mapContact(contact: any): GoogleContact {
        return {
            resourceName: contact.resourceName,
            etag: contact.etag,
            metadata: contact.metadata ? {
                sources: (contact.metadata.sources || []).map((source: any) => ({
                    type: source.type,
                    id: source.id,
                    etag: source.etag,
                })),
            } : undefined,
            names: (contact.names || []).map((name: any) => ({
                displayName: name.displayName,
                givenName: name.givenName,
                familyName: name.familyName,
                primary: Boolean(name.metadata?.primary),
            })),
            emailAddresses: (contact.emailAddresses || []).map((email: any) => ({
                value: email.value,
                type: email.type,
                formattedType: email.formattedType,
                displayName: email.displayName,
                primary: Boolean(email.metadata?.primary),
            })),
            phoneNumbers: (contact.phoneNumbers || []).map((phone: any) => ({
                value: phone.value,
                type: phone.type,
                formattedType: phone.formattedType,
                canonicalForm: phone.canonicalForm,
                primary: Boolean(phone.metadata?.primary),
            })),
            organizations: (contact.organizations || []).map((organization: any) => ({
                name: organization.name,
                title: organization.title,
                department: organization.department,
                domain: organization.domain,
                type: organization.type,
                current: organization.current,
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
