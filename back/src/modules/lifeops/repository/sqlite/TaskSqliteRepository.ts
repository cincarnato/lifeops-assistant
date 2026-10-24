
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ITaskRepository} from '../../interfaces/ITaskRepository'
import type {ITask, ITaskBase} from "../../interfaces/ITask";
import {SqliteTableField} from "@drax/common-back";
import InstructionServiceFactory from '../../factory/services/InstructionServiceFactory.js';

class TaskSqliteRepository extends AbstractSqliteRepository<ITask, ITaskBase, ITaskBase> implements ITaskRepository {

    protected db: any;
    protected tableName: string = 'Task';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['title', 'description', 'redmineIssueId', 'emailMessageId', 'calendarEventId'];
    protected booleanFields: string[] = ['urgent', 'delegable'];
    protected jsonFields: string[] = ['tags', 'notes', 'statusHistory'];
    protected identifier: string = '_id';
    protected populateFields = [
        {field: 'tenant', table: 'tenants', identifier: '_id'},
        { field: 'instruction', table: 'Instruction', identifier: '_id' },
        { field: 'goals', table: 'goals', identifier: '_id' },
{ field: 'project', table: 'project', identifier: '_id' },
{ field: 'delegate', table: 'Delegate', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: 'tenant', type: 'TEXT', primary: false, unique: false},
        {name: "title", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "instruction", type: "TEXT", unique: undefined, primary: false},
{name: "source", type: "TEXT", unique: undefined, primary: false},
{name: "type", type: "TEXT", unique: undefined, primary: false},
{name: "lifeArea", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "priority", type: "TEXT", unique: undefined, primary: false},
{name: "importance", type: "TEXT", unique: undefined, primary: false},
{name: "goals", type: "TEXT", unique: undefined, primary: false},
{name: "project", type: "TEXT", unique: undefined, primary: false},
{name: "valueScore", type: "NUMERIC", unique: undefined, primary: false},
{name: "valueScore", type: "TEXT", unique: undefined, primary: false},
{name: "motivationScore", type: "NUMERIC", unique: undefined, primary: false},
{name: "motivationScore", type: "TEXT", unique: undefined, primary: false},
{name: "effortScore", type: "NUMERIC", unique: undefined, primary: false},
{name: "effortScore", type: "TEXT", unique: undefined, primary: false},
{name: "urgent", type: "INTEGER", unique: undefined, primary: false},
{name: "delegable", type: "INTEGER", unique: false, primary: false},
{name: "delegate", type: "TEXT", unique: false, primary: false},
{name: "dueDate", type: "TEXT", unique: undefined, primary: false},
{name: "scheduledDate", type: "TEXT", unique: undefined, primary: false},
{name: "completedAt", type: "TEXT", unique: undefined, primary: false},
{name: "redmineIssueId", type: "TEXT", unique: undefined, primary: false},
{name: "emailMessageId", type: "TEXT", unique: undefined, primary: false},
{name: "calendarEventId", type: "TEXT", unique: undefined, primary: false},
{name: "tags", type: "TEXT", unique: undefined, primary: false},
{name: "notes", type: "TEXT", unique: undefined, primary: false},
{name: "statusHistory", type: "TEXT", unique: false, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "archivedAt", type: "TEXT", unique: undefined, primary: false}
    ]

    async decorate(item: any) {
        await super.decorate(item)
        if (item?.instruction?._id) {
            item.instruction = await InstructionServiceFactory.instance.findById(item.instruction._id)
        }
        if (item?.delegate?.contact) {
            item.delegate.contact = this.db.prepare('SELECT * FROM Contact WHERE _id = ?').get(item.delegate.contact)
        }
    }
}

export default TaskSqliteRepository
export {TaskSqliteRepository}
