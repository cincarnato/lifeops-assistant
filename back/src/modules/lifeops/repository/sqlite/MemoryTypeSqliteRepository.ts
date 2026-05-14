
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IMemoryTypeRepository} from '../../interfaces/IMemoryTypeRepository'
import type {IMemoryType, IMemoryTypeBase} from "../../interfaces/IMemoryType";
import {SqliteTableField} from "@drax/common-back";

class MemoryTypeSqliteRepository extends AbstractSqliteRepository<IMemoryType, IMemoryTypeBase, IMemoryTypeBase> implements IMemoryTypeRepository {

    protected db: any;
    protected tableName: string = 'MemoryType';
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

export default MemoryTypeSqliteRepository
export {MemoryTypeSqliteRepository}

