
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IServiceRepository} from '../../interfaces/IServiceRepository'
import type {IService, IServiceBase} from "../../interfaces/IService";
import {SqliteTableField} from "@drax/common-back";

class ServiceSqliteRepository extends AbstractSqliteRepository<IService, IServiceBase, IServiceBase> implements IServiceRepository {

    protected db: any;
    protected tableName: string = 'Service';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name'];
    protected booleanFields: string[] = ['active'];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'businessPartner', table: 'businessPartner', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "businessPartner", type: "TEXT", unique: undefined, primary: false},
{name: "type", type: "TEXT", unique: undefined, primary: false},
{name: "amount", type: "NUMERIC", unique: undefined, primary: false},
{name: "amount", type: "TEXT", unique: undefined, primary: false},
{name: "frequency", type: "TEXT", unique: undefined, primary: false},
{name: "active", type: "TEXT", unique: undefined, primary: false}
    ]

}

export default ServiceSqliteRepository
export {ServiceSqliteRepository}
