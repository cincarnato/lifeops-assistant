
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITaskStatusRepository} from '../../interfaces/ITaskStatusRepository'
import type {ITaskStatus, ITaskStatusBase} from "../../interfaces/ITaskStatus";
import {SqliteTableField} from "@drax/common-back";

class TaskStatusSqliteRepository extends AbstractSqliteRepository<ITaskStatus, ITaskStatusBase, ITaskStatusBase> implements ITaskStatusRepository {

    protected db: any;
    protected tableName: string = 'TaskStatus';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'description'];
    protected booleanFields: string[] = ['completesTask', 'archivesTask'];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "color", type: "TEXT", unique: false, primary: false},
{name: "completesTask", type: "INTEGER", unique: false, primary: false},
{name: "archivesTask", type: "INTEGER", unique: false, primary: false}
    ]
  
}

export default TaskStatusSqliteRepository
export {TaskStatusSqliteRepository}
