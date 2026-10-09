
import {AbstractMongoRepository} from "@drax/crud-back";
import {ServiceModel} from "../../models/ServiceModel.js";
import type {IServiceRepository} from '../../interfaces/IServiceRepository'
import type {IService, IServiceBase} from "../../interfaces/IService";


class ServiceMongoRepository extends AbstractMongoRepository<IService, IServiceBase, IServiceBase> implements IServiceRepository {

    constructor() {
        super();
        this._model = ServiceModel;
        this._searchFields = ['name'];
        this._populateFields = ['businessPartner'];
        this._lean = true
    }

}

export default ServiceMongoRepository
export {ServiceMongoRepository}
