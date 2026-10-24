import {AbstractMongoRepository} from "@drax/crud-back";
import {DelegateModel} from "../../models/DelegateModel.js";
import type {IDelegateRepository} from '../../interfaces/IDelegateRepository'
import type {IDelegate, IDelegateBase} from "../../interfaces/IDelegate";


class DelegateMongoRepository extends AbstractMongoRepository<IDelegate, IDelegateBase, IDelegateBase> implements IDelegateRepository {

    constructor() {
        super();
        this._model = DelegateModel;
        this._searchFields = ['description'];
        this._populateFields = ['tenant', 'contact', 'user'];
        this._lean = true
    }

}

export default DelegateMongoRepository
export {DelegateMongoRepository}
