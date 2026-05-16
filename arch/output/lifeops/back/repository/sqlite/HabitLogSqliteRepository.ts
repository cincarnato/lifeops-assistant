
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IHabitLogRepository} from '../../interfaces/IHabitLogRepository'
import type {IHabitLog, IHabitLogBase} from "../../interfaces/IHabitLog";
import {SqliteTableField} from "@drax/common-back";

class HabitLogSqliteRepository extends AbstractSqliteRepository<IHabitLog, IHabitLogBase, IHabitLogBase> implements IHabitLogRepository {

    protected db: any;
    protected tableName: string = 'HabitLog';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'habit', table: 'habit', identifier: '_id' },
{ field: 'task', table: 'task', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "habit", type: "TEXT", unique: undefined, primary: false},
{name: "date", type: "TEXT", unique: undefined, primary: false},
{name: "task", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default HabitLogSqliteRepository
export {HabitLogSqliteRepository}

