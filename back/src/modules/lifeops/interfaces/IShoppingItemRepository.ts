
import type {IShoppingItem, IShoppingItemBase} from './IShoppingItem'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IShoppingItemRepository extends IDraxCrudRepository<IShoppingItem, IShoppingItemBase, IShoppingItemBase>{
    deletePurchasedByUser(userId: string): Promise<number>;

}

export {IShoppingItemRepository}
