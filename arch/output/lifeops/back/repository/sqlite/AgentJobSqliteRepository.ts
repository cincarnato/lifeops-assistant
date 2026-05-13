
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IAgentJobRepository} from '../../interfaces/IAgentJobRepository'
import type {IAgentJob, IAgentJobBase} from "../../interfaces/IAgentJob";
import {SqliteTableField} from "@drax/common-back";

class AgentJobSqliteRepository extends AbstractSqliteRepository<IAgentJob, IAgentJobBase, IAgentJobBase> implements IAgentJobRepository {

    protected db: any;
    protected tableName: string = 'AgentJob';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'description'];
    protected booleanFields: string[] = ['active'];
    protected jsonFields: string[] = ['agent', 'schedule', 'execution', 'runtime'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'createdBy', table: 'createdBy', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "active", type: "TEXT", unique: undefined, primary: false},
{name: "agent", type: "TEXT", unique: undefined, primary: false},
{name: "schedule", type: "TEXT", unique: undefined, primary: false},
{name: "execution", type: "TEXT", unique: undefined, primary: false},
{name: "runtime", type: "TEXT", unique: undefined, primary: false},
{name: "createdBy", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default AgentJobSqliteRepository
export {AgentJobSqliteRepository}

