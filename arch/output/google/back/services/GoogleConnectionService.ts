
import type{IGoogleConnectionRepository} from "../interfaces/IGoogleConnectionRepository";
import type {IGoogleConnectionBase, IGoogleConnection} from "../interfaces/IGoogleConnection";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class GoogleConnectionService extends AbstractService<IGoogleConnection, IGoogleConnectionBase, IGoogleConnectionBase> {


    constructor(GoogleConnectionRepository: IGoogleConnectionRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(GoogleConnectionRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default GoogleConnectionService
export {GoogleConnectionService}
