
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IContactTypeRepository} from '../../interfaces/IContactTypeRepository'
import type {IContactType, IContactTypeBase} from "../../interfaces/IContactType";
import {SqliteTableField} from "@drax/common-back";

class ContactTypeSqliteRepository extends AbstractSqliteRepository<IContactType, IContactTypeBase, IContactTypeBase> implements IContactTypeRepository {

    protected db: any;
    protected tableName: string = 'ContactType';
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

export default ContactTypeSqliteRepository
export {ContactTypeSqliteRepository}

