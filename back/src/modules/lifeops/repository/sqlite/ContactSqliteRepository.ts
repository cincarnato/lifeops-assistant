
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IContactRepository} from '../../interfaces/IContactRepository'
import type {IContact, IContactBase} from "../../interfaces/IContact";
import {SqliteTableField} from "@drax/common-back";

class ContactSqliteRepository extends AbstractSqliteRepository<IContact, IContactBase, IContactBase> implements IContactRepository {

    protected db: any;
    protected tableName: string = 'Contact';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['firstName', 'lastName', 'displayName', 'jobTitle', 'department'];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = ['emails', 'phones', 'tags'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'client', table: 'client', identifier: '_id' },
{ field: 'company', table: 'company', identifier: '_id' },
{ field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "firstName", type: "TEXT", unique: undefined, primary: false},
{name: "lastName", type: "TEXT", unique: undefined, primary: false},
{name: "displayName", type: "TEXT", unique: undefined, primary: false},
{name: "type", type: "TEXT", unique: undefined, primary: false},
{name: "priority", type: "TEXT", unique: undefined, primary: false},
{name: "client", type: "TEXT", unique: undefined, primary: false},
{name: "company", type: "TEXT", unique: undefined, primary: false},
{name: "jobTitle", type: "TEXT", unique: undefined, primary: false},
{name: "department", type: "TEXT", unique: undefined, primary: false},
{name: "emails", type: "TEXT", unique: undefined, primary: false},
{name: "phones", type: "TEXT", unique: undefined, primary: false},
{name: "valueScore", type: "REAL", unique: undefined, primary: false},
{name: "valueScore", type: "TEXT", unique: undefined, primary: false},
{name: "relationshipScore", type: "REAL", unique: undefined, primary: false},
{name: "relationshipScore", type: "TEXT", unique: undefined, primary: false},
{name: "tags", type: "TEXT", unique: undefined, primary: false},
{name: "notes", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
{name: "archivedAt", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default ContactSqliteRepository
export {ContactSqliteRepository}
