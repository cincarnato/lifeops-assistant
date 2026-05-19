
import type{IContactRepository} from "../interfaces/IContactRepository";
import type {IContactBase, IContact} from "../interfaces/IContact";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ContactService extends AbstractService<IContact, IContactBase, IContactBase> {


    constructor(ContactRepository: IContactRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ContactRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.transformCreate = this.normalizeCreateData.bind(this)
        this.transformUpdate = this.normalizeCreateData.bind(this)
        this.transformUpdatePartial = this.normalizePartialData.bind(this)
        
    }

    private async normalizeCreateData(data: IContactBase): Promise<IContactBase> {
        return {
            ...data,
            source: data.source || 'manual',
            status: data.status || 'active',
            givenName: this.capitalizeFirstLetter(data.givenName),
            familyName: this.capitalizeFirstLetter(data.familyName),
            displayName: this.capitalizeFirstLetter(data.displayName)
        }
    }

    private async normalizePartialData(data: Partial<IContactBase>): Promise<Partial<IContactBase>> {
        return {
            ...data,
            givenName: this.capitalizeFirstLetter(data.givenName),
            familyName: this.capitalizeFirstLetter(data.familyName),
            displayName: this.capitalizeFirstLetter(data.displayName)
        }
    }

    private capitalizeFirstLetter(value?: string): string | undefined {
        if (!value) return value
        return value.charAt(0).toLocaleUpperCase('es') + value.slice(1)
    }

}

export default ContactService
export {ContactService}
