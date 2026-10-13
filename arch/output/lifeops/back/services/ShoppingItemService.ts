
import type{IShoppingItemRepository} from "../interfaces/IShoppingItemRepository";
import type {IShoppingItemBase, IShoppingItem} from "../interfaces/IShoppingItem";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ShoppingItemService extends AbstractService<IShoppingItem, IShoppingItemBase, IShoppingItemBase> {


    constructor(ShoppingItemRepository: IShoppingItemRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ShoppingItemRepository, baseSchema, fullSchema);

        this._validateOutput = true

    }

}

export default ShoppingItemService
export {ShoppingItemService}
