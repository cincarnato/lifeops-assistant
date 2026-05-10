
import type{IContactTypeRepository} from "../interfaces/IContactTypeRepository";
import type {IContactTypeBase, IContactType} from "../interfaces/IContactType";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ContactTypeService extends AbstractService<IContactType, IContactTypeBase, IContactTypeBase> {


    constructor(ContactTypeRepository: IContactTypeRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ContactTypeRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default ContactTypeService
export {ContactTypeService}
