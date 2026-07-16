
import {AbstractMongoRepository} from "@drax/crud-back";
import {WhatsAppWebhookEventModel} from "../../models/WhatsAppWebhookEventModel.js";
import type {IWhatsAppWebhookEventRepository} from '../../interfaces/IWhatsAppWebhookEventRepository'
import type {IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase} from "../../interfaces/IWhatsAppWebhookEvent";


class WhatsAppWebhookEventMongoRepository extends AbstractMongoRepository<IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase, IWhatsAppWebhookEventBase> implements IWhatsAppWebhookEventRepository {

    constructor() {
        super();
        this._model = WhatsAppWebhookEventModel;
        this._searchFields = ['object', 'field', 'wabaId', 'phoneNumberId', 'deduplicationKey'];
        this._populateFields = ['tenantId', 'phoneNumberRef'];
        this._lean = true
    }

    async insertMany(events: IWhatsAppWebhookEventBase[], options: { ordered?: boolean } = {}): Promise<IWhatsAppWebhookEvent[]> {
        return await WhatsAppWebhookEventModel.insertMany(events, options) as IWhatsAppWebhookEvent[];
    }

}

export default WhatsAppWebhookEventMongoRepository
export {WhatsAppWebhookEventMongoRepository}
