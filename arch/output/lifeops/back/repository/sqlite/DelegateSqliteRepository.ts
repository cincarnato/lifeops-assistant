import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IDelegateRepository} from '../../interfaces/IDelegateRepository'
import type {IDelegate, IDelegateBase} from "../../interfaces/IDelegate";
import {SqliteTableField} from "@drax/common-back";

class DelegateSqliteRepository extends AbstractSqliteRepository<IDelegate, IDelegateBase, IDelegateBase> implements IDelegateRepository {

    protected db: any;
    protected tableName: string = 'Delegate';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['description'];
    protected booleanFields: string[] = ['active'];
    protected jsonFields: string[] = ['skills'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'contact', table: 'contact', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "contact", type: "TEXT", unique: undefined, primary: false},
{name: "skills", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "active", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false}
    ]

}

export default DelegateSqliteRepository
export {DelegateSqliteRepository}
