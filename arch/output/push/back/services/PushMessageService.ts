
import type{IPushMessageRepository} from "../interfaces/IPushMessageRepository";
import type {IPushMessageBase, IPushMessage} from "../interfaces/IPushMessage";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class PushMessageService extends AbstractService<IPushMessage, IPushMessageBase, IPushMessageBase> {


    constructor(PushMessageRepository: IPushMessageRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(PushMessageRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default PushMessageService
export {PushMessageService}
