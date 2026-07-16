
import type{IWhatsAppPhoneNumberRepository} from "../interfaces/IWhatsAppPhoneNumberRepository";
import type {IWhatsAppPhoneNumberBase, IWhatsAppPhoneNumber} from "../interfaces/IWhatsAppPhoneNumber";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class WhatsAppPhoneNumberService extends AbstractService<IWhatsAppPhoneNumber, IWhatsAppPhoneNumberBase, IWhatsAppPhoneNumberBase> {


    constructor(WhatsAppPhoneNumberRepository: IWhatsAppPhoneNumberRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(WhatsAppPhoneNumberRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default WhatsAppPhoneNumberService
export {WhatsAppPhoneNumberService}
