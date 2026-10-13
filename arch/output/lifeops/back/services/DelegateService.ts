import type{IDelegateRepository} from "../interfaces/IDelegateRepository";
import type {IDelegateBase, IDelegate} from "../interfaces/IDelegate";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class DelegateService extends AbstractService<IDelegate, IDelegateBase, IDelegateBase> {


    constructor(DelegateRepository: IDelegateRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(DelegateRepository, baseSchema, fullSchema);

        this._validateOutput = true

    }

}

export default DelegateService
export {DelegateService}
