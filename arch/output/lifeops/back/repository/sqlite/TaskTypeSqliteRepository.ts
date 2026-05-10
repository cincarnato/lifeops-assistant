
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITaskTypeRepository} from '../../interfaces/ITaskTypeRepository'
import type {ITaskType, ITaskTypeBase} from "../../interfaces/ITaskType";
import {SqliteTableField} from "@drax/common-back";

class TaskTypeSqliteRepository extends AbstractSqliteRepository<ITaskType, ITaskTypeBase, ITaskTypeBase> implements ITaskTypeRepository {

    protected db: any;
    protected tableName: string = 'TaskType';
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

export default TaskTypeSqliteRepository
export {TaskTypeSqliteRepository}

