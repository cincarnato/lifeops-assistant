
import type{IContactRepository} from "../interfaces/IContactRepository";
import type {IContactBase, IContact} from "../interfaces/IContact";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ContactService extends AbstractService<IContact, IContactBase, IContactBase> {


    constructor(ContactRepository: IContactRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ContactRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default ContactService
export {ContactService}
