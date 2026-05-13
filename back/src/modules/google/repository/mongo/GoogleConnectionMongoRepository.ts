
import {AbstractMongoRepository} from "@drax/crud-back";
import {GoogleConnectionModel} from "../../models/GoogleConnectionModel.js";
import type {IGoogleConnectionRepository} from '../../interfaces/IGoogleConnectionRepository'
import type {IGoogleConnection, IGoogleConnectionBase} from "../../interfaces/IGoogleConnection";


class GoogleConnectionMongoRepository extends AbstractMongoRepository<IGoogleConnection, IGoogleConnectionBase, IGoogleConnectionBase> implements IGoogleConnectionRepository {

    constructor() {
        super();
        this._model = GoogleConnectionModel;
        this._searchFields = ['googleEmail', 'googleUserId'];
        this._populateFields = ['userId'];
        this._lean = true
    }

}

export default GoogleConnectionMongoRepository
export {GoogleConnectionMongoRepository}

