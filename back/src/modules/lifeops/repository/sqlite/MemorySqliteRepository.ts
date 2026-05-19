
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IMemoryRepository} from '../../interfaces/IMemoryRepository'
import type {IMemory, IMemoryBase} from "../../interfaces/IMemory";
import {SqliteTableField} from "@drax/common-back";

class MemorySqliteRepository extends AbstractSqliteRepository<IMemory, IMemoryBase, IMemoryBase> implements IMemoryRepository {

    protected db: any;
    protected tableName: string = 'Memory';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['title', 'content', 'type', 'lifeArea'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['tags'];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "title", type: "TEXT", unique: undefined, primary: false},
{name: "content", type: "TEXT", unique: undefined, primary: false},
{name: "type", type: "TEXT", unique: undefined, primary: false},
{name: "lifeArea", type: "TEXT", unique: undefined, primary: false},
{name: "tags", type: "TEXT", unique: undefined, primary: false},
{name: "priority", type: "TEXT", unique: undefined, primary: false},
{name: "source", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default MemorySqliteRepository
export {MemorySqliteRepository}
