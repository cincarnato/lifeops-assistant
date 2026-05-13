
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IAgentJobExecutionRepository} from '../../interfaces/IAgentJobExecutionRepository'
import type {IAgentJobExecution, IAgentJobExecutionBase} from "../../interfaces/IAgentJobExecution";
import {SqliteTableField} from "@drax/common-back";

class AgentJobExecutionSqliteRepository extends AbstractSqliteRepository<IAgentJobExecution, IAgentJobExecutionBase, IAgentJobExecutionBase> implements IAgentJobExecutionRepository {

    protected db: any;
    protected tableName: string = 'AgentJobExecution';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['promptSnapshot', 'result', 'toolCalls', 'error', 'usage'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'jobId', table: 'jobId', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "jobId", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "trigger", type: "TEXT", unique: undefined, primary: false},
{name: "scheduledFor", type: "TEXT", unique: undefined, primary: false},
{name: "startedAt", type: "TEXT", unique: undefined, primary: false},
{name: "finishedAt", type: "TEXT", unique: undefined, primary: false},
{name: "durationMs", type: "NUMERIC", unique: undefined, primary: false},
{name: "durationMs", type: "TEXT", unique: undefined, primary: false},
{name: "attempt", type: "NUMERIC", unique: undefined, primary: false},
{name: "attempt", type: "TEXT", unique: undefined, primary: false},
{name: "promptSnapshot", type: "TEXT", unique: undefined, primary: false},
{name: "result", type: "TEXT", unique: undefined, primary: false},
{name: "toolCalls", type: "TEXT", unique: undefined, primary: false},
{name: "error", type: "TEXT", unique: undefined, primary: false},
{name: "usage", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default AgentJobExecutionSqliteRepository
export {AgentJobExecutionSqliteRepository}

