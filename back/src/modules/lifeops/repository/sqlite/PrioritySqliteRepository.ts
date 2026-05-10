
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IPriorityRepository} from '../../interfaces/IPriorityRepository'
import type {IPriority, IPriorityBase} from "../../interfaces/IPriority";
import {SqliteTableField} from "@drax/common-back";

class PrioritySqliteRepository extends AbstractSqliteRepository<IPriority, IPriorityBase, IPriorityBase> implements IPriorityRepository {

    protected db: any;
    protected tableName: string = 'Priority';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'description', 'color'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "color", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default PrioritySqliteRepository
export {PrioritySqliteRepository}

