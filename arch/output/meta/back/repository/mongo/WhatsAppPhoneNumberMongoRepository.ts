
import {AbstractMongoRepository} from "@drax/crud-back";
import {WhatsAppPhoneNumberModel} from "../../models/WhatsAppPhoneNumberModel.js";
import type {IWhatsAppPhoneNumberRepository} from '../../interfaces/IWhatsAppPhoneNumberRepository'
import type {IWhatsAppPhoneNumber, IWhatsAppPhoneNumberBase} from "../../interfaces/IWhatsAppPhoneNumber";


class WhatsAppPhoneNumberMongoRepository extends AbstractMongoRepository<IWhatsAppPhoneNumber, IWhatsAppPhoneNumberBase, IWhatsAppPhoneNumberBase> implements IWhatsAppPhoneNumberRepository {

    constructor() {
        super();
        this._model = WhatsAppPhoneNumberModel;
        this._searchFields = ['phoneNumberId', 'wabaId', 'displayPhoneNumber'];
        this._populateFields = ['tenantId'];
        this._lean = true
    }

}

export default WhatsAppPhoneNumberMongoRepository
export {WhatsAppPhoneNumberMongoRepository}

