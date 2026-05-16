
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IPurposeRepository} from '../../interfaces/IPurposeRepository'
import type {IPurpose, IPurposeBase} from "../../interfaces/IPurpose";
import {SqliteTableField} from "@drax/common-back";

class PurposeSqliteRepository extends AbstractSqliteRepository<IPurpose, IPurposeBase, IPurposeBase> implements IPurposeRepository {

    protected db: any;
    protected tableName: string = 'Purpose';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['title', 'statement'];
    protected booleanFields: string[] = ['isPrimary', 'active'];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "title", type: "TEXT", unique: undefined, primary: false},
{name: "statement", type: "TEXT", unique: undefined, primary: false},
{name: "isPrimary", type: "TEXT", unique: undefined, primary: false},
{name: "active", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default PurposeSqliteRepository
export {PurposeSqliteRepository}

