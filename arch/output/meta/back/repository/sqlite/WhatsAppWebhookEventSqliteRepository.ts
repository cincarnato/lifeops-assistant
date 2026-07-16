
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IWhatsAppWebhookEventRepository} from '../../interfaces/IWhatsAppWebhookEventRepository'
import type {IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase} from "../../interfaces/IWhatsAppWebhookEvent";
import {SqliteTableField} from "@drax/common-back";

class WhatsAppWebhookEventSqliteRepository extends AbstractSqliteRepository<IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase, IWhatsAppWebhookEventBase> implements IWhatsAppWebhookEventRepository {

    protected db: any;
    protected tableName: string = 'WhatsAppWebhookEvent';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['object', 'field', 'wabaId', 'phoneNumberId', 'deduplicationKey'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['lastError', 'payload'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'tenantId', table: 'tenantId', identifier: '_id' },
{ field: 'phoneNumberRef', table: 'phoneNumberRef', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "tenantId", type: "TEXT", unique: undefined, primary: false},
{name: "phoneNumberRef", type: "TEXT", unique: undefined, primary: false},
{name: "object", type: "TEXT", unique: undefined, primary: false},
{name: "field", type: "TEXT", unique: undefined, primary: false},
{name: "wabaId", type: "TEXT", unique: undefined, primary: false},
{name: "phoneNumberId", type: "TEXT", unique: undefined, primary: false},
{name: "receivedAt", type: "TEXT", unique: undefined, primary: false},
{name: "eventAt", type: "TEXT", unique: undefined, primary: false},
{name: "processingStatus", type: "TEXT", unique: undefined, primary: false},
{name: "processingAttempts", type: "NUMERIC", unique: undefined, primary: false},
{name: "processingAttempts", type: "TEXT", unique: undefined, primary: false},
{name: "processedAt", type: "TEXT", unique: undefined, primary: false},
{name: "lastProcessingAttemptAt", type: "TEXT", unique: undefined, primary: false},
{name: "lastError", type: "TEXT", unique: undefined, primary: false},
{name: "payload", type: "TEXT", unique: undefined, primary: false},
{name: "deduplicationKey", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default WhatsAppWebhookEventSqliteRepository
export {WhatsAppWebhookEventSqliteRepository}

