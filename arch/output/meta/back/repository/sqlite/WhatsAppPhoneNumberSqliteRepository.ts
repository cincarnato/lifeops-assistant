
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IWhatsAppPhoneNumberRepository} from '../../interfaces/IWhatsAppPhoneNumberRepository'
import type {IWhatsAppPhoneNumber, IWhatsAppPhoneNumberBase} from "../../interfaces/IWhatsAppPhoneNumber";
import {SqliteTableField} from "@drax/common-back";

class WhatsAppPhoneNumberSqliteRepository extends AbstractSqliteRepository<IWhatsAppPhoneNumber, IWhatsAppPhoneNumberBase, IWhatsAppPhoneNumberBase> implements IWhatsAppPhoneNumberRepository {

    protected db: any;
    protected tableName: string = 'WhatsAppPhoneNumber';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['phoneNumberId', 'wabaId', 'displayPhoneNumber'];
    protected booleanFields: string[] = ['enabled'];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'tenantId', table: 'tenantId', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "tenantId", type: "TEXT", unique: undefined, primary: false},
{name: "phoneNumberId", type: "TEXT", unique: undefined, primary: false},
{name: "wabaId", type: "TEXT", unique: undefined, primary: false},
{name: "displayPhoneNumber", type: "TEXT", unique: undefined, primary: false},
{name: "enabled", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default WhatsAppPhoneNumberSqliteRepository
export {WhatsAppPhoneNumberSqliteRepository}

