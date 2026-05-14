
import type{IMemoryTypeRepository} from "../interfaces/IMemoryTypeRepository";
import type {IMemoryTypeBase, IMemoryType} from "../interfaces/IMemoryType";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class MemoryTypeService extends AbstractService<IMemoryType, IMemoryTypeBase, IMemoryTypeBase> {


    constructor(MemoryTypeRepository: IMemoryTypeRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(MemoryTypeRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default MemoryTypeService
export {MemoryTypeService}
