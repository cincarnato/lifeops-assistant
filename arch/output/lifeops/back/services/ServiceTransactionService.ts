
import type{IServiceTransactionRepository} from "../interfaces/IServiceTransactionRepository";
import type {IServiceTransactionBase, IServiceTransaction} from "../interfaces/IServiceTransaction";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ServiceTransactionService extends AbstractService<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase> {


    constructor(ServiceTransactionRepository: IServiceTransactionRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ServiceTransactionRepository, baseSchema, fullSchema);

        this._validateOutput = true

    }

}

export default ServiceTransactionService
export {ServiceTransactionService}
