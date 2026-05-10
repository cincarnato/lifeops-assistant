
import {AbstractMongoRepository} from "@drax/crud-back";
import {PriorityModel} from "../../models/PriorityModel.js";
import type {IPriorityRepository} from '../../interfaces/IPriorityRepository'
import type {IPriority, IPriorityBase} from "../../interfaces/IPriority";


class PriorityMongoRepository extends AbstractMongoRepository<IPriority, IPriorityBase, IPriorityBase> implements IPriorityRepository {

    constructor() {
        super();
        this._model = PriorityModel;
        this._searchFields = ['name', 'description', 'color'];
        this._populateFields = [];
        this._lean = true
    }

}

export default PriorityMongoRepository
export {PriorityMongoRepository}

