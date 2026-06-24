
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IDayPlanRepository} from '../../interfaces/IDayPlanRepository'
import type {IDayPlan, IDayPlanBase} from "../../interfaces/IDayPlan";
import {SqliteTableField} from "@drax/common-back";

class DayPlanSqliteRepository extends AbstractSqliteRepository<IDayPlan, IDayPlanBase, IDayPlanBase> implements IDayPlanRepository {

    protected db: any;
    protected tableName: string = 'DayPlan';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['events', 'tasks', 'habits', 'suggestions'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' },
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "date", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "events", type: "TEXT", unique: undefined, primary: false},
{name: "tasks", type: "TEXT", unique: undefined, primary: false},
{name: "habits", type: "TEXT", unique: undefined, primary: false},
{name: "suggestions", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default DayPlanSqliteRepository
export {DayPlanSqliteRepository}
