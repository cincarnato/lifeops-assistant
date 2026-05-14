
import type{IMemoryRepository} from "../interfaces/IMemoryRepository";
import type {IMemoryBase, IMemory} from "../interfaces/IMemory";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class MemoryService extends AbstractService<IMemory, IMemoryBase, IMemoryBase> {


    constructor(MemoryRepository: IMemoryRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(MemoryRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default MemoryService
export {MemoryService}
