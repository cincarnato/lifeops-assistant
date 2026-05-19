
import {AbstractMongoRepository} from "@drax/crud-back";
import {MemoryModel} from "../../models/MemoryModel.js";
import type {IMemoryRepository} from '../../interfaces/IMemoryRepository'
import type {IMemory, IMemoryBase} from "../../interfaces/IMemory";


class MemoryMongoRepository extends AbstractMongoRepository<IMemory, IMemoryBase, IMemoryBase> implements IMemoryRepository {

    constructor() {
        super();
        this._model = MemoryModel;
        this._searchFields = ['title', 'content', 'type', 'lifeArea'];
        this._populateFields = [];
        this._lean = true
    }

}

export default MemoryMongoRepository
export {MemoryMongoRepository}
