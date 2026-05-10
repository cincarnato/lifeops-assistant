
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IClientTypeRepository} from '../../interfaces/IClientTypeRepository'
import type {IClientType, IClientTypeBase} from "../../interfaces/IClientType";
import {SqliteTableField} from "@drax/common-back";

class ClientTypeSqliteRepository extends AbstractSqliteRepository<IClientType, IClientTypeBase, IClientTypeBase> implements IClientTypeRepository {

    protected db: any;
    protected tableName: string = 'ClientType';
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

export default ClientTypeSqliteRepository
export {ClientTypeSqliteRepository}

