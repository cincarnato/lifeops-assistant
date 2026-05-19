
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IPushMessageRepository} from '../../interfaces/IPushMessageRepository'
import type {IPushMessage, IPushMessageBase} from "../../interfaces/IPushMessage";
import {SqliteTableField} from "@drax/common-back";

class PushMessageSqliteRepository extends AbstractSqliteRepository<IPushMessage, IPushMessageBase, IPushMessageBase> implements IPushMessageRepository {

    protected db: any;
    protected tableName: string = 'PushMessage';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['title', 'body', 'providerMessageId', 'type', 'errorMessage'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "title", type: "TEXT", unique: undefined, primary: false},
{name: "body", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "providerMessageId", type: "TEXT", unique: undefined, primary: false},
{name: "type", type: "TEXT", unique: undefined, primary: false},
{name: "errorMessage", type: "TEXT", unique: undefined, primary: false},
{name: "sentAt", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default PushMessageSqliteRepository
export {PushMessageSqliteRepository}

