
import ShoppingItemServiceFactory from "../factory/services/ShoppingItemServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ShoppingItemPermissions from "../permissions/ShoppingItemPermissions.js";
import type {IShoppingItem, IShoppingItemBase} from "../interfaces/IShoppingItem";

class ShoppingItemController extends AbstractFastifyController<IShoppingItem, IShoppingItemBase, IShoppingItemBase>   {

    constructor() {
        super(ShoppingItemServiceFactory.instance, ShoppingItemPermissions)
        this.tenantField = "tenant";
        this.userField = "user";

        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;

        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

}

export default ShoppingItemController;
export {
    ShoppingItemController
}
