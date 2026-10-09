
import type{IContactRepository} from "../interfaces/IContactRepository";
import type {IContactBase, IContact} from "../interfaces/IContact";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ContactService extends AbstractService<IContact, IContactBase, IContactBase> {

    async migrateBusinessPartnerReference(): Promise<void> {
        await (this._repository as IContactRepository).migrateBusinessPartnerReference?.()
    }


    constructor(ContactRepository: IContactRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ContactRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.transformCreate = this.normalizeCreateData.bind(this)
        this.transformUpdate = this.normalizeCreateData.bind(this)
        this.transformUpdatePartial = this.normalizePartialData.bind(this)
        this.onCreated = this.syncCreatedContactToGoogle.bind(this)
        this.onUpdated = this.syncSavedContactToGoogle.bind(this)
        this.onUpdatedPartial = this.syncSavedContactToGoogle.bind(this)
        
    }

    private async normalizeCreateData(data: IContactBase): Promise<IContactBase> {
        const normalized = {
            ...data,
            source: data.source || 'manual',
            status: data.status || 'active',
            givenName: this.capitalizeFirstLetter(data.givenName),
            familyName: this.capitalizeFirstLetter(data.familyName),
        }

        return {
            ...normalized,
            displayName: this.resolveDisplayName(normalized),
        }
    }

    private async normalizePartialData(data: Partial<IContactBase>): Promise<Partial<IContactBase>> {
        const normalized: Partial<IContactBase> = {...data}

        if (data.givenName !== undefined) normalized.givenName = this.capitalizeFirstLetter(data.givenName)
        if (data.familyName !== undefined) normalized.familyName = this.capitalizeFirstLetter(data.familyName)

        return normalized
    }

    private resolveDisplayName(data: Partial<IContactBase>): string {
        const structuredName = [data.givenName, data.familyName]
            .map(value => value?.trim())
            .filter(Boolean)
            .join(' ')

        return structuredName
            || data.displayName?.trim()
            || data.nickname?.trim()
            || data.emails?.find(email => email.primary)?.value
            || data.emails?.[0]?.value
            || data.phones?.find(phone => phone.primary)?.value
            || data.phones?.[0]?.value
            || 'Contacto'
    }

    private capitalizeFirstLetter(value?: string): string | undefined {
        if (!value) return value
        return value.charAt(0).toLocaleUpperCase('es') + value.slice(1)
    }

    private async syncCreatedContactToGoogle(contact: IContact): Promise<void> {
        console.info("contact.google.sync_on_create", {
            contactId: contact._id,
            source: contact.source,
            externalProvider: contact.externalProvider,
            hasExternalId: Boolean(contact.externalId),
        })

        return this.syncSavedContactToGoogle(contact)
    }

    private async syncSavedContactToGoogle(contact: IContact): Promise<void> {
        const skipReason = this.getGoogleCreateSkipReason(contact)
        if (skipReason) {
            console.info("contact.google.create_skipped", {
                contactId: contact._id,
                reason: skipReason,
                source: contact.source,
                externalProvider: contact.externalProvider,
                externalId: contact.externalId,
            })
            return
        }

        console.info("contact.google.create_scheduled", {
            contactId: contact._id,
            source: contact.source,
            emailCount: contact.emails?.length || 0,
            phoneCount: contact.phones?.length || 0,
        })

        this.createGoogleContact(contact).catch(error => {
            console.warn("contact.google.create_failed", {
                contactId: contact._id,
                error: error?.message || error,
            })
        })
    }

    private getGoogleCreateSkipReason(contact: IContact): string | null {
        if (contact.source === 'google') {
            return 'source_google'
        }
        if (contact.externalProvider === 'google') {
            return 'external_provider_google'
        }
        if (contact.externalId) {
            return 'external_id_exists'
        }
        return null
    }

    private async createGoogleContact(contact: IContact): Promise<void> {
        console.info("contact.google.create_started", {
            contactId: contact._id,
        })

        const {default: GoogleContactsServiceFactory} = await import("../../google/factory/GoogleContactsServiceFactory.js")
        const googleContact = await GoogleContactsServiceFactory.instance.createContactFromLifeOps(contact)

        console.info("contact.google.create_succeeded", {
            contactId: contact._id,
            googleResourceName: googleContact.resourceName,
        })

        await this.saveGoogleSyncMetadata(contact, googleContact)

        console.info("contact.google.metadata_saved", {
            contactId: contact._id,
            googleResourceName: googleContact.resourceName,
        })
    }

    async syncContactToGoogle(contactId: string): Promise<IContact> {
        const contact = await this.findById(contactId)
        if (!contact) {
            throw new Error("contact.not_found")
        }

        const {default: GoogleContactsServiceFactory} = await import("../../google/factory/GoogleContactsServiceFactory.js")
        const googleContact = contact.externalProvider === 'google' && contact.externalId
            ? await GoogleContactsServiceFactory.instance.updateContactFromLifeOps(contact)
            : await GoogleContactsServiceFactory.instance.createContactFromLifeOps(contact)

        return await this.saveGoogleSyncMetadata(contact, googleContact)
    }

    private async saveGoogleSyncMetadata(contact: IContact, googleContact: any): Promise<IContact> {
        const primaryName = googleContact.names?.[0] || {}
        const primaryPhoto = googleContact.photos?.find((photo: any) => photo.primary)
            || googleContact.photos?.find((photo: any) => photo.type !== 'default')
            || googleContact.photos?.[0]

        return await this.updatePartial(contact._id, {
            externalProvider: 'google',
            externalId: googleContact.resourceName,
            externalEtag: googleContact.etag || '',
            externalRaw: googleContact.raw,
            displayName: primaryName.displayName || contact.displayName,
            givenName: primaryName.givenName || '',
            familyName: primaryName.familyName || '',
            photoUrl: primaryPhoto?.value || (contact.photoUrl?.startsWith('data:') ? '' : contact.photoUrl) || '',
            lastSyncedAt: new Date(),
            tags: Array.from(new Set([...(contact.tags || []), 'google'])),
        } as any)
    }

}

export default ContactService
export {ContactService}
