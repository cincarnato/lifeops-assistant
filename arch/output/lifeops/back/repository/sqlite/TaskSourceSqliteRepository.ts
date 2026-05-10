
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITaskSourceRepository} from '../../interfaces/ITaskSourceRepository'
import type {ITaskSource, ITaskSourceBase} from "../../interfaces/ITaskSource";
import {SqliteTableField} from "@drax/common-back";

class TaskSourceSqliteRepository extends AbstractSqliteRepository<ITaskSource, ITaskSourceBase, ITaskSourceBase> implements ITaskSourceRepository {

    protected db: any;
    protected tableName: string = 'TaskSource';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'description'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default TaskSourceSqliteRepository
export {TaskSourceSqliteRepository}

