
import {AbstractMongoRepository} from "@drax/crud-back";
import {ClientTypeModel} from "../../models/ClientTypeModel.js";
import type {IClientTypeRepository} from '../../interfaces/IClientTypeRepository'
import type {IClientType, IClientTypeBase} from "../../interfaces/IClientType";


class ClientTypeMongoRepository extends AbstractMongoRepository<IClientType, IClientTypeBase, IClientTypeBase> implements IClientTypeRepository {

    constructor() {
        super();
        this._model = ClientTypeModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = [];
        this._lean = true
    }

}

export default ClientTypeMongoRepository
export {ClientTypeMongoRepository}

