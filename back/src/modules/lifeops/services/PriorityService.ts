
import type{IPriorityRepository} from "../interfaces/IPriorityRepository";
import type {IPriorityBase, IPriority} from "../interfaces/IPriority";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class PriorityService extends AbstractService<IPriority, IPriorityBase, IPriorityBase> {


    constructor(PriorityRepository: IPriorityRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(PriorityRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default PriorityService
export {PriorityService}
