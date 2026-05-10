
import {AbstractMongoRepository} from "@drax/crud-back";
import {ContactTypeModel} from "../../models/ContactTypeModel.js";
import type {IContactTypeRepository} from '../../interfaces/IContactTypeRepository'
import type {IContactType, IContactTypeBase} from "../../interfaces/IContactType";


class ContactTypeMongoRepository extends AbstractMongoRepository<IContactType, IContactTypeBase, IContactTypeBase> implements IContactTypeRepository {

    constructor() {
        super();
        this._model = ContactTypeModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = [];
        this._lean = true
    }

}

export default ContactTypeMongoRepository
export {ContactTypeMongoRepository}

