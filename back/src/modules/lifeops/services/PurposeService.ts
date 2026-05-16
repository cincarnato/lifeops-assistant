
import type{IPurposeRepository} from "../interfaces/IPurposeRepository";
import type {IPurposeBase, IPurpose} from "../interfaces/IPurpose";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class PurposeService extends AbstractService<IPurpose, IPurposeBase, IPurposeBase> {


    constructor(PurposeRepository: IPurposeRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(PurposeRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default PurposeService
export {PurposeService}
