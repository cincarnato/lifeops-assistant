
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IGoalRepository} from '../../interfaces/IGoalRepository'
import type {IGoal, IGoalBase} from "../../interfaces/IGoal";
import {SqliteTableField} from "@drax/common-back";

class GoalSqliteRepository extends AbstractSqliteRepository<IGoal, IGoalBase, IGoalBase> implements IGoalRepository {

    protected db: any;
    protected tableName: string = 'Goal';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'description'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['constraints', 'tags'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "priority", type: "TEXT", unique: undefined, primary: false},
{name: "valueScore", type: "REAL", unique: undefined, primary: false},
{name: "motivationScore", type: "REAL", unique: undefined, primary: false},
{name: "effortScore", type: "REAL", unique: undefined, primary: false},
{name: "timeHorizon", type: "TEXT", unique: undefined, primary: false},
{name: "targetDate", type: "TEXT", unique: undefined, primary: false},
{name: "completedAt", type: "TEXT", unique: undefined, primary: false},
{name: "archivedAt", type: "TEXT", unique: undefined, primary: false},
{name: "progressPercent", type: "REAL", unique: undefined, primary: false},
{name: "successCriteria", type: "TEXT", unique: undefined, primary: false},
{name: "purpose", type: "TEXT", unique: undefined, primary: false},
{name: "constraints", type: "TEXT", unique: undefined, primary: false},
{name: "tags", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default GoalSqliteRepository
export {GoalSqliteRepository}
