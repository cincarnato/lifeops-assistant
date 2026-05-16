
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ILifeAreaRepository} from '../../interfaces/ILifeAreaRepository'
import type {ILifeArea, ILifeAreaBase} from "../../interfaces/ILifeArea";
import {SqliteTableField} from "@drax/common-back";

class LifeAreaSqliteRepository extends AbstractSqliteRepository<ILifeArea, ILifeAreaBase, ILifeAreaBase> implements ILifeAreaRepository {

    protected db: any;
    protected tableName: string = 'LifeArea';
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

export default LifeAreaSqliteRepository
export {LifeAreaSqliteRepository}

