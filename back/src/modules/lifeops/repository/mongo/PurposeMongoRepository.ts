
import {AbstractMongoRepository} from "@drax/crud-back";
import {PurposeModel} from "../../models/PurposeModel.js";
import type {IPurposeRepository} from '../../interfaces/IPurposeRepository'
import type {IPurpose, IPurposeBase} from "../../interfaces/IPurpose";


class PurposeMongoRepository extends AbstractMongoRepository<IPurpose, IPurposeBase, IPurposeBase> implements IPurposeRepository {

    constructor() {
        super();
        this._model = PurposeModel;
        this._searchFields = ['title', 'statement'];
        this._populateFields = [];
        this._lean = true
    }

}

export default PurposeMongoRepository
export {PurposeMongoRepository}

