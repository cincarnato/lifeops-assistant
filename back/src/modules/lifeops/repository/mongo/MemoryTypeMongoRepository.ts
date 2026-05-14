
import {AbstractMongoRepository} from "@drax/crud-back";
import {MemoryTypeModel} from "../../models/MemoryTypeModel.js";
import type {IMemoryTypeRepository} from '../../interfaces/IMemoryTypeRepository'
import type {IMemoryType, IMemoryTypeBase} from "../../interfaces/IMemoryType";


class MemoryTypeMongoRepository extends AbstractMongoRepository<IMemoryType, IMemoryTypeBase, IMemoryTypeBase> implements IMemoryTypeRepository {

    constructor() {
        super();
        this._model = MemoryTypeModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = [];
        this._lean = true
    }

}

export default MemoryTypeMongoRepository
export {MemoryTypeMongoRepository}

