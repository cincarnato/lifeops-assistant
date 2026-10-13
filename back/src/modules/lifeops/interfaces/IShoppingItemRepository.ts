
import type {IShoppingItem, IShoppingItemBase} from './IShoppingItem'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IShoppingItemRepository extends IDraxCrudRepository<IShoppingItem, IShoppingItemBase, IShoppingItemBase>{

}

export {IShoppingItemRepository}
