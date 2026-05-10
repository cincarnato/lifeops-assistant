
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ICompanyTypeRepository} from '../../interfaces/ICompanyTypeRepository'
import type {ICompanyType, ICompanyTypeBase} from "../../interfaces/ICompanyType";
import {SqliteTableField} from "@drax/common-back";

class CompanyTypeSqliteRepository extends AbstractSqliteRepository<ICompanyType, ICompanyTypeBase, ICompanyTypeBase> implements ICompanyTypeRepository {

    protected db: any;
    protected tableName: string = 'CompanyType';
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

export default CompanyTypeSqliteRepository
export {CompanyTypeSqliteRepository}

