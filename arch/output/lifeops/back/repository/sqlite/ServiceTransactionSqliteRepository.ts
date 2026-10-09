
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IServiceTransactionRepository} from '../../interfaces/IServiceTransactionRepository'
import type {IServiceTransaction, IServiceTransactionBase} from "../../interfaces/IServiceTransaction";
import {SqliteTableField} from "@drax/common-back";

class ServiceTransactionSqliteRepository extends AbstractSqliteRepository<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase> implements IServiceTransactionRepository {

    protected db: any;
    protected tableName: string = 'ServiceTransaction';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'service', table: 'service', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "service", type: "TEXT", unique: undefined, primary: false},
{name: "period", type: "TEXT", unique: undefined, primary: false},
{name: "amount", type: "NUMERIC", unique: undefined, primary: false},
{name: "amount", type: "TEXT", unique: undefined, primary: false},
{name: "status", type: "TEXT", unique: undefined, primary: false},
{name: "paidAt", type: "TEXT", unique: undefined, primary: false}
    ]

}

export default ServiceTransactionSqliteRepository
export {ServiceTransactionSqliteRepository}
