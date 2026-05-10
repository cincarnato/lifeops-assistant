
import {AbstractMongoRepository} from "@drax/crud-back";
import {ClientModel} from "../../models/ClientModel.js";
import type {IClientRepository} from '../../interfaces/IClientRepository'
import type {IClient, IClientBase} from "../../interfaces/IClient";


class ClientMongoRepository extends AbstractMongoRepository<IClient, IClientBase, IClientBase> implements IClientRepository {

    constructor() {
        super();
        this._model = ClientModel;
        this._searchFields = ['name', 'description', 'website'];
        this._populateFields = ['company', 'mainContact', 'user'];
        this._lean = true
    }

}

export default ClientMongoRepository
export {ClientMongoRepository}
