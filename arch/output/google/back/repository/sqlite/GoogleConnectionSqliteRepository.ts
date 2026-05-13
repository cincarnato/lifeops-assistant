
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IGoogleConnectionRepository} from '../../interfaces/IGoogleConnectionRepository'
import type {IGoogleConnection, IGoogleConnectionBase} from "../../interfaces/IGoogleConnection";
import {SqliteTableField} from "@drax/common-back";

class GoogleConnectionSqliteRepository extends AbstractSqliteRepository<IGoogleConnection, IGoogleConnectionBase, IGoogleConnectionBase> implements IGoogleConnectionRepository {

    protected db: any;
    protected tableName: string = 'GoogleConnection';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['googleEmail', 'googleUserId'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['scope'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'userId', table: 'userId', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "userId", type: "TEXT", unique: undefined, primary: false},
{name: "provider", type: "TEXT", unique: undefined, primary: false},
{name: "googleEmail", type: "TEXT", unique: undefined, primary: false},
{name: "googleUserId", type: "TEXT", unique: true, primary: false},
{name: "accessToken", type: "TEXT", unique: undefined, primary: false},
{name: "refreshToken", type: "TEXT", unique: undefined, primary: false},
{name: "scope", type: "TEXT", unique: undefined, primary: false},
{name: "expiryDate", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "lastUsedAt", type: "TEXT", unique: undefined, primary: false},
{name: "connectedAt", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default GoogleConnectionSqliteRepository
export {GoogleConnectionSqliteRepository}

