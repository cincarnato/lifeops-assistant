
import {AbstractMongoRepository} from "@drax/crud-back";
import {LifeAreaModel} from "../../models/LifeAreaModel.js";
import type {ILifeAreaRepository} from '../../interfaces/ILifeAreaRepository'
import type {ILifeArea, ILifeAreaBase} from "../../interfaces/ILifeArea";


class LifeAreaMongoRepository extends AbstractMongoRepository<ILifeArea, ILifeAreaBase, ILifeAreaBase> implements ILifeAreaRepository {

    constructor() {
        super();
        this._model = LifeAreaModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = [];
        this._lean = true
    }

}

export default LifeAreaMongoRepository
export {LifeAreaMongoRepository}

