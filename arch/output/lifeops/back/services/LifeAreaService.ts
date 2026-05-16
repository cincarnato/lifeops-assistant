
import type{ILifeAreaRepository} from "../interfaces/ILifeAreaRepository";
import type {ILifeAreaBase, ILifeArea} from "../interfaces/ILifeArea";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class LifeAreaService extends AbstractService<ILifeArea, ILifeAreaBase, ILifeAreaBase> {


    constructor(LifeAreaRepository: ILifeAreaRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(LifeAreaRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default LifeAreaService
export {LifeAreaService}
