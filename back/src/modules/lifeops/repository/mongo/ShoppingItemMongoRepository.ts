
import {AbstractMongoRepository} from "@drax/crud-back";
import {ShoppingItemModel} from "../../models/ShoppingItemModel.js";
import type {IShoppingItemRepository} from '../../interfaces/IShoppingItemRepository'
import type {IShoppingItem, IShoppingItemBase} from "../../interfaces/IShoppingItem";


class ShoppingItemMongoRepository extends AbstractMongoRepository<IShoppingItem, IShoppingItemBase, IShoppingItemBase> implements IShoppingItemRepository {

    constructor() {
        super();
        this._model = ShoppingItemModel;
        this._searchFields = ['name'];
        this._populateFields = ['user'];
        this._lean = true
    }

}

export default ShoppingItemMongoRepository
export {ShoppingItemMongoRepository}
