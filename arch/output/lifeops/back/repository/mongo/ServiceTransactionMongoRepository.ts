
import {AbstractMongoRepository} from "@drax/crud-back";
import {ServiceTransactionModel} from "../../models/ServiceTransactionModel.js";
import type {IServiceTransactionRepository} from '../../interfaces/IServiceTransactionRepository'
import type {IServiceTransaction, IServiceTransactionBase} from "../../interfaces/IServiceTransaction";


class ServiceTransactionMongoRepository extends AbstractMongoRepository<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase> implements IServiceTransactionRepository {

    constructor() {
        super();
        this._model = ServiceTransactionModel;
        this._searchFields = [];
        this._populateFields = ['service'];
        this._lean = true
    }

}

export default ServiceTransactionMongoRepository
export {ServiceTransactionMongoRepository}
