
import type{IServiceRepository} from "../interfaces/IServiceRepository";
import type {IServiceBase, IService} from "../interfaces/IService";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ServiceService extends AbstractService<IService, IServiceBase, IServiceBase> {


    constructor(ServiceRepository: IServiceRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ServiceRepository, baseSchema, fullSchema);

        this._validateOutput = true

    }

}

export default ServiceService
export {ServiceService}
