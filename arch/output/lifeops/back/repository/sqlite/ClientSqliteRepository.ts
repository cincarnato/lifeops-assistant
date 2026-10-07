
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IClientRepository} from '../../interfaces/IClientRepository'
import type {IClient, IClientBase} from "../../interfaces/IClient";
import {SqliteTableField} from "@drax/common-back";

class ClientSqliteRepository extends AbstractSqliteRepository<IClient, IClientBase, IClientBase> implements IClientRepository {

    protected db: any;
    protected tableName: string = 'Client';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name', 'legalName', 'taxCondition', 'taxIdType', 'taxIdNumber', 'taxAddress', 'taxEmail', 'description', 'website', 'aliases'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['roles', 'aliases', 'redmineProjectIds', 'tags'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'mainContact', table: 'mainContact', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "legalName", type: "TEXT", unique: undefined, primary: false},
{name: "taxCondition", type: "TEXT", unique: undefined, primary: false},
{name: "taxIdType", type: "TEXT", unique: undefined, primary: false},
{name: "taxIdNumber", type: "TEXT", unique: undefined, primary: false},
{name: "taxAddress", type: "TEXT", unique: undefined, primary: false},
{name: "taxEmail", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "roles", type: "TEXT", unique: undefined, primary: false},
{name: "priority", type: "TEXT", unique: undefined, primary: false},
{name: "website", type: "TEXT", unique: undefined, primary: false},
{name: "aliases", type: "TEXT", unique: undefined, primary: false},
{name: "mainContact", type: "TEXT", unique: undefined, primary: false},
{name: "redmineProjectIds", type: "TEXT", unique: undefined, primary: false},
{name: "tags", type: "TEXT", unique: undefined, primary: false},
{name: "notes", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "archivedAt", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default ClientSqliteRepository
export {ClientSqliteRepository}

