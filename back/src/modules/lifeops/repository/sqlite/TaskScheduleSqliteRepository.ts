
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITaskScheduleRepository} from '../../interfaces/ITaskScheduleRepository'
import type {ITaskSchedule, ITaskScheduleBase} from "../../interfaces/ITaskSchedule";
import {SqliteTableField} from "@drax/common-back";

class TaskScheduleSqliteRepository extends AbstractSqliteRepository<ITaskSchedule, ITaskScheduleBase, ITaskScheduleBase> implements ITaskScheduleRepository {

    protected db: any;
    protected tableName: string = 'TaskSchedule';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name'];
    protected booleanFields: string[] = ['active'];
    protected jsonFields: string[] = ['task', 'schedule', 'dueDateRule', 'runtime'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "active", type: "TEXT", unique: undefined, primary: false},
{name: "task", type: "TEXT", unique: undefined, primary: false},
{name: "schedule", type: "TEXT", unique: undefined, primary: false},
{name: "dueDateRule", type: "TEXT", unique: undefined, primary: false},
{name: "runtime", type: "TEXT", unique: undefined, primary: false},
{name: "startAt", type: "TEXT", unique: undefined, primary: false},
{name: "endAt", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default TaskScheduleSqliteRepository
export {TaskScheduleSqliteRepository}

