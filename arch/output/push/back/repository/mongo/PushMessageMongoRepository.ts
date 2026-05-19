
import {AbstractMongoRepository} from "@drax/crud-back";
import {PushMessageModel} from "../../models/PushMessageModel.js";
import type {IPushMessageRepository} from '../../interfaces/IPushMessageRepository'
import type {IPushMessage, IPushMessageBase} from "../../interfaces/IPushMessage";


class PushMessageMongoRepository extends AbstractMongoRepository<IPushMessage, IPushMessageBase, IPushMessageBase> implements IPushMessageRepository {

    constructor() {
        super();
        this._model = PushMessageModel;
        this._searchFields = ['title', 'body', 'providerMessageId', 'type', 'errorMessage'];
        this._populateFields = ['user'];
        this._lean = true
    }

}

export default PushMessageMongoRepository
export {PushMessageMongoRepository}

