
import {AbstractMongoRepository} from "@drax/crud-back";
import {ContactModel} from "../../models/ContactModel.js";
import type {IContactRepository} from '../../interfaces/IContactRepository'
import type {IContact, IContactBase} from "../../interfaces/IContact";


class ContactMongoRepository extends AbstractMongoRepository<IContact, IContactBase, IContactBase> implements IContactRepository {

    constructor() {
        super();
        this._model = ContactModel;
        this._searchFields = ['displayName', 'givenName', 'familyName', 'nickname', 'emails.value', 'phones.value', 'organization.name', 'organization.title' ];
        this._populateFields = ['user'];
        this._lean = true
    }

}

export default ContactMongoRepository
export {ContactMongoRepository}
