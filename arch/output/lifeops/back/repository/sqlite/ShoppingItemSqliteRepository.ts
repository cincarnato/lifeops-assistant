
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IShoppingItemRepository} from '../../interfaces/IShoppingItemRepository'
import type {IShoppingItem, IShoppingItemBase} from "../../interfaces/IShoppingItem";
import {SqliteTableField} from "@drax/common-back";

class ShoppingItemSqliteRepository extends AbstractSqliteRepository<IShoppingItem, IShoppingItemBase, IShoppingItemBase> implements IShoppingItemRepository {

    protected db: any;
    protected tableName: string = 'ShoppingItem';
    protected dataBaseFile: string;
    protected searchFields: string[] = ['name'];
    protected booleanFields: string[] = ['purchased'];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'user', table: 'user', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "quantity", type: "TEXT", unique: undefined, primary: false},
{name: "purchased", type: "TEXT", unique: undefined, primary: false},
{name: "purchasedAt", type: "TEXT", unique: undefined, primary: false},
{name: "user", type: "TEXT", unique: undefined, primary: false}
    ]

}

export default ShoppingItemSqliteRepository
export {ShoppingItemSqliteRepository}
