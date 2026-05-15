
import {AbstractMongoRepository} from "@drax/crud-back";
import {SourceModel} from "../../models/SourceModel.js";
import type {ISourceRepository} from '../../interfaces/ISourceRepository'
import type {ISource, ISourceBase} from "../../interfaces/ISource";


class SourceMongoRepository extends AbstractMongoRepository<ISource, ISourceBase, ISourceBase> implements ISourceRepository {

    constructor() {
        super();
        this._model = SourceModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = [];
        this._lean = true
    }

}

export default SourceMongoRepository
export {SourceMongoRepository}

