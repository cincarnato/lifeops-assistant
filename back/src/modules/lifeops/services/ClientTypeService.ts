
import type{IClientTypeRepository} from "../interfaces/IClientTypeRepository";
import type {IClientTypeBase, IClientType} from "../interfaces/IClientType";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ClientTypeService extends AbstractService<IClientType, IClientTypeBase, IClientTypeBase> {


    constructor(ClientTypeRepository: IClientTypeRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ClientTypeRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default ClientTypeService
export {ClientTypeService}
