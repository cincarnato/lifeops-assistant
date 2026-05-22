
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IHabitRepository} from '../../interfaces/IHabitRepository'
import type {IHabit, IHabitBase} from "../../interfaces/IHabit";
import {SqliteTableField} from "@drax/common-back";

class HabitSqliteRepository extends AbstractSqliteRepository<IHabit, IHabitBase, IHabitBase> implements IHabitRepository {

    protected db: any;
    protected tableName: string = 'Habit';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'description', 'lifeArea'];
    protected booleanFields: string[] = ['active', 'generateTask'];
    protected jsonFields: string[] = ['frequency', 'taskTemplate'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "lifeArea", type: "TEXT", unique: undefined, primary: false},
{name: "active", type: "TEXT", unique: undefined, primary: false},
{name: "frequency", type: "TEXT", unique: undefined, primary: false},
{name: "generateTask", type: "TEXT", unique: undefined, primary: false},
{name: "taskTemplate", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default HabitSqliteRepository
export {HabitSqliteRepository}
