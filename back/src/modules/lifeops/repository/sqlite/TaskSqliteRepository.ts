
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITaskRepository} from '../../interfaces/ITaskRepository'
import type {ITask, ITaskBase} from "../../interfaces/ITask";
import {SqliteTableField} from "@drax/common-back";

class TaskSqliteRepository extends AbstractSqliteRepository<ITask, ITaskBase, ITaskBase> implements ITaskRepository {

    protected db: any;
    protected tableName: string = 'Task';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['title', 'description', 'nextAction', 'redmineIssueId', 'emailMessageId', 'calendarEventId'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['tags'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'goals', table: 'goals', identifier: '_id' },
{ field: 'project', table: 'project', identifier: '_id' },
{ field: 'client', table: 'client', identifier: '_id' },
{ field: 'contacts', table: 'contacts', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "title", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "source", type: "TEXT", unique: undefined, primary: false},
{name: "type", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "priority", type: "TEXT", unique: undefined, primary: false},
{name: "goals", type: "TEXT", unique: undefined, primary: false},
{name: "project", type: "TEXT", unique: undefined, primary: false},
{name: "client", type: "TEXT", unique: undefined, primary: false},
{name: "contacts", type: "TEXT", unique: undefined, primary: false},
{name: "valueScore", type: "NUMERIC", unique: undefined, primary: false},
{name: "valueScore", type: "TEXT", unique: undefined, primary: false},
{name: "motivationScore", type: "NUMERIC", unique: undefined, primary: false},
{name: "motivationScore", type: "TEXT", unique: undefined, primary: false},
{name: "effortScore", type: "NUMERIC", unique: undefined, primary: false},
{name: "effortScore", type: "TEXT", unique: undefined, primary: false},
{name: "urgencyScore", type: "NUMERIC", unique: undefined, primary: false},
{name: "urgencyScore", type: "TEXT", unique: undefined, primary: false},
{name: "dueDate", type: "TEXT", unique: undefined, primary: false},
{name: "scheduledDate", type: "TEXT", unique: undefined, primary: false},
{name: "completedAt", type: "TEXT", unique: undefined, primary: false},
{name: "estimatedMinutes", type: "NUMERIC", unique: undefined, primary: false},
{name: "estimatedMinutes", type: "TEXT", unique: undefined, primary: false},
{name: "spentMinutes", type: "NUMERIC", unique: undefined, primary: false},
{name: "spentMinutes", type: "TEXT", unique: undefined, primary: false},
{name: "nextAction", type: "TEXT", unique: undefined, primary: false},
{name: "redmineIssueId", type: "TEXT", unique: undefined, primary: false},
{name: "emailMessageId", type: "TEXT", unique: undefined, primary: false},
{name: "calendarEventId", type: "TEXT", unique: undefined, primary: false},
{name: "tags", type: "TEXT", unique: undefined, primary: false},
{name: "notes", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "archivedAt", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default TaskSqliteRepository
export {TaskSqliteRepository}
