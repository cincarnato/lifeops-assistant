import DelegateServiceFactory from "../factory/services/DelegateServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import DelegatePermissions from "../permissions/DelegatePermissions.js";
import type {IDelegate, IDelegateBase} from "../interfaces/IDelegate";

class DelegateController extends AbstractFastifyController<IDelegate, IDelegateBase, IDelegateBase>   {

    constructor() {
        super(DelegateServiceFactory.instance, DelegatePermissions)
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

export default DelegateController;
export {
    DelegateController
}
