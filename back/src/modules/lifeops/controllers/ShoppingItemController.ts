
import ShoppingItemServiceFactory from "../factory/services/ShoppingItemServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ShoppingItemPermissions from "../permissions/ShoppingItemPermissions.js";
import type {IShoppingItem, IShoppingItemBase} from "../interfaces/IShoppingItem";

class ShoppingItemController extends AbstractFastifyController<IShoppingItem, IShoppingItemBase, IShoppingItemBase>   {

    async purgePurchased(request, reply) {
        try {
            request.rbac.assertOrPermissions([ShoppingItemPermissions.Delete, ShoppingItemPermissions.Manage]);
            return await ShoppingItemServiceFactory.instance.purgePurchased(request.rbac.userId, request.rbac.tenantId);
        } catch (error) {
            this.handleError(error, reply);
        }
    }

    constructor() {
        super(ShoppingItemServiceFactory.instance, ShoppingItemPermissions)
        this.tenantField = "tenant";
        this.userField = "user";

        this.tenantFilter = true;
        this.tenantSetter = true;
        this.tenantAssert = true;

        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

}

export default ShoppingItemController;
export {
    ShoppingItemController
}
