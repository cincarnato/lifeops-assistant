
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IBusinessPartnerRepository} from '../../interfaces/IBusinessPartnerRepository'
import type {IBusinessPartner, IBusinessPartnerBase} from "../../interfaces/IBusinessPartner";
import {SqliteTableField} from "@drax/common-back";

class BusinessPartnerSqliteRepository extends AbstractSqliteRepository<IBusinessPartner, IBusinessPartnerBase, IBusinessPartnerBase> implements IBusinessPartnerRepository {

    protected db: any;
    protected tableName: string = 'BusinessPartner';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'aliases', 'legalName', 'taxCondition', 'taxIdType', 'taxIdNumber', 'taxAddress', 'taxEmail', 'description', 'website'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['roles', 'aliases', 'tags'];
    protected identifier: string = '_id';
    protected populateFields = [
        {field: 'tenant', table: 'tenants', identifier: '_id'},
        { field: 'mainContact', table: 'mainContact', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: 'tenant', type: 'TEXT', primary: false, unique: false},
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "legalName", type: "TEXT", unique: undefined, primary: false},
{name: "taxCondition", type: "TEXT", unique: undefined, primary: false},
{name: "taxIdType", type: "TEXT", unique: undefined, primary: false},
{name: "taxIdNumber", type: "TEXT", unique: undefined, primary: false},
{name: "taxAddress", type: "TEXT", unique: undefined, primary: false},
{name: "taxEmail", type: "TEXT", unique: undefined, primary: false},
{name: "bankCbu", type: "TEXT", unique: undefined, primary: false},
{name: "bankAlias", type: "TEXT", unique: undefined, primary: false},
{name: "bankAccount", type: "TEXT", unique: undefined, primary: false},
{name: "bankName", type: "TEXT", unique: undefined, primary: false},
{name: "paymentReceiptEmail", type: "TEXT", unique: undefined, primary: false},
{name: "paymentReceiptUrl", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "roles", type: "TEXT", unique: undefined, primary: false},
{name: "priority", type: "TEXT", unique: undefined, primary: false},
{name: "website", type: "TEXT", unique: undefined, primary: false},
{name: "aliases", type: "TEXT", unique: undefined, primary: false},
{name: "mainContact", type: "TEXT", unique: undefined, primary: false},
{name: "tags", type: "TEXT", unique: undefined, primary: false},
{name: "notes", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "archivedAt", type: "TEXT", unique: undefined, primary: false}
    ]

}

export default BusinessPartnerSqliteRepository
export {BusinessPartnerSqliteRepository}
