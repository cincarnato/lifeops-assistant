
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IProjectRepository} from '../../interfaces/IProjectRepository'
import type {IProject, IProjectBase} from "../../interfaces/IProject";
import {SqliteTableField} from "@drax/common-back";

class ProjectSqliteRepository extends AbstractSqliteRepository<IProject, IProjectBase, IProjectBase> implements IProjectRepository {

    protected db: any;
    protected tableName: string = 'Project';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'description'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['tags'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'goals', table: 'goals', identifier: '_id' },
{ field: 'client', table: 'client', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "priority", type: "TEXT", unique: undefined, primary: false},
{name: "goals", type: "TEXT", unique: undefined, primary: false},
{name: "client", type: "TEXT", unique: undefined, primary: false},
{name: "valueScore", type: "REAL", unique: undefined, primary: false},
{name: "valueScore", type: "TEXT", unique: undefined, primary: false},
{name: "motivationScore", type: "REAL", unique: undefined, primary: false},
{name: "motivationScore", type: "TEXT", unique: undefined, primary: false},
{name: "effortScore", type: "REAL", unique: undefined, primary: false},
{name: "effortScore", type: "TEXT", unique: undefined, primary: false},
{name: "priorityScore", type: "REAL", unique: undefined, primary: false},
{name: "priorityScore", type: "TEXT", unique: undefined, primary: false},
{name: "startDate", type: "TEXT", unique: undefined, primary: false},
{name: "targetDate", type: "TEXT", unique: undefined, primary: false},
{name: "completedAt", type: "TEXT", unique: undefined, primary: false},
{name: "progressPercent", type: "REAL", unique: undefined, primary: false},
{name: "progressPercent", type: "TEXT", unique: undefined, primary: false},
{name: "tags", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "archivedAt", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default ProjectSqliteRepository
export {ProjectSqliteRepository}

