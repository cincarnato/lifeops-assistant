
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ISourceRepository} from '../../interfaces/ISourceRepository'
import type {ISource, ISourceBase} from "../../interfaces/ISource";
import {SqliteTableField} from "@drax/common-back";

class SourceSqliteRepository extends AbstractSqliteRepository<ISource, ISourceBase, ISourceBase> implements ISourceRepository {

    protected db: any;
    protected tableName: string = 'Source';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'description'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default SourceSqliteRepository
export {SourceSqliteRepository}

