
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IShoppingItem, IShoppingItemBase} from '../interfaces/IShoppingItem'

class ShoppingItemProvider extends AbstractCrudRestProvider<IShoppingItem, IShoppingItemBase, IShoppingItemBase> {

  static singleton: ShoppingItemProvider

  constructor() {
   super('/api/shopping-items')
  }

  async purgePurchased(): Promise<{ deletedCount: number }> {
    return await this.httpClient.delete(this.basePath + '/purchased') as { deletedCount: number }
  }

  static get instance() {
    if(!ShoppingItemProvider.singleton){
      ShoppingItemProvider.singleton = new ShoppingItemProvider()
    }
    return ShoppingItemProvider.singleton
  }

}

export default ShoppingItemProvider
