
import type{IContactRepository} from "../interfaces/IContactRepository";
import type {IContactBase, IContact} from "../interfaces/IContact";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ContactService extends AbstractService<IContact, IContactBase, IContactBase> {


    constructor(ContactRepository: IContactRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ContactRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.transformCreate = this.normalizeCreateData.bind(this)
        
    }

    private async normalizeCreateData(data: IContactBase): Promise<IContactBase> {
        return {
            ...data,
            firstName: this.capitalizeFirstLetter(data.firstName),
            lastName: this.capitalizeFirstLetter(data.lastName),
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
