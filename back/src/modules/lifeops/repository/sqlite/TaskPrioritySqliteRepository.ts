
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITaskPriorityRepository} from '../../interfaces/ITaskPriorityRepository'
import type {ITaskPriority, ITaskPriorityBase} from "../../interfaces/ITaskPriority";
import {SqliteTableField} from "@drax/common-back";

class TaskPrioritySqliteRepository extends AbstractSqliteRepository<ITaskPriority, ITaskPriorityBase, ITaskPriorityBase> implements ITaskPriorityRepository {

    protected db: any;
    protected tableName: string = 'TaskPriority';
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

export default TaskPrioritySqliteRepository
export {TaskPrioritySqliteRepository}

