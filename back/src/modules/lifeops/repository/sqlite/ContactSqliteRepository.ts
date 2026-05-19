
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IContactRepository} from '../../interfaces/IContactRepository'
import type {IContact, IContactBase} from "../../interfaces/IContact";
import {SqliteTableField} from "@drax/common-back";

class ContactSqliteRepository extends AbstractSqliteRepository<IContact, IContactBase, IContactBase> implements IContactRepository {

    protected db: any;
    protected tableName: string = 'Contact';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['displayName', 'givenName', 'familyName', 'nickname', 'externalId'];
    protected booleanFields: string[] = [];
protected jsonFields: string[] = ['externalRaw', 'emails', 'phones', 'organization', 'addresses', 'birthday', 'tags'];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "source", type: "TEXT", unique: undefined, primary: false},
{name: "externalProvider", type: "TEXT", unique: undefined, primary: false},
{name: "externalId", type: "TEXT", unique: undefined, primary: false},
{name: "externalEtag", type: "TEXT", unique: undefined, primary: false},
{name: "externalRaw", type: "TEXT", unique: undefined, primary: false},
{name: "displayName", type: "TEXT", unique: undefined, primary: false},
{name: "givenName", type: "TEXT", unique: undefined, primary: false},
{name: "familyName", type: "TEXT", unique: undefined, primary: false},
{name: "nickname", type: "TEXT", unique: undefined, primary: false},
{name: "emails", type: "TEXT", unique: undefined, primary: false},
{name: "phones", type: "TEXT", unique: undefined, primary: false},
{name: "organization", type: "TEXT", unique: undefined, primary: false},
{name: "addresses", type: "TEXT", unique: undefined, primary: false},
{name: "photoUrl", type: "TEXT", unique: undefined, primary: false},
{name: "birthday", type: "TEXT", unique: undefined, primary: false},
{name: "notes", type: "TEXT", unique: undefined, primary: false},
{name: "tags", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "lastSyncedAt", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false},
    ]
  
}

export default ContactSqliteRepository
export {ContactSqliteRepository}
