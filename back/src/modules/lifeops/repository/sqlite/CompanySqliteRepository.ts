
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ICompanyRepository} from '../../interfaces/ICompanyRepository'
import type {ICompany, ICompanyBase} from "../../interfaces/ICompany";
import {SqliteTableField} from "@drax/common-back";

class CompanySqliteRepository extends AbstractSqliteRepository<ICompany, ICompanyBase, ICompanyBase> implements ICompanyRepository {

    protected db: any;
    protected tableName: string = 'Company';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'aliases', 'legalName', 'taxIdType', 'taxIdNumber', 'description', 'website'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['aliases', 'emailDomains', 'tags'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "legalName", type: "TEXT", unique: undefined, primary: false},
{name: "taxIdType", type: "TEXT", unique: undefined, primary: false},
{name: "taxIdNumber", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "type", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "website", type: "TEXT", unique: undefined, primary: false},
{name: "aliases", type: "TEXT", unique: undefined, primary: false},
{name: "emailDomains", type: "TEXT", unique: undefined, primary: false},
{name: "tags", type: "TEXT", unique: undefined, primary: false},
{name: "notes", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "archivedAt", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default CompanySqliteRepository
export {CompanySqliteRepository}
