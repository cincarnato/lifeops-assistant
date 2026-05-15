
import type{ISourceRepository} from "../interfaces/ISourceRepository";
import type {ISourceBase, ISource} from "../interfaces/ISource";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class SourceService extends AbstractService<ISource, ISourceBase, ISourceBase> {


    constructor(SourceRepository: ISourceRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(SourceRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default SourceService
export {SourceService}
