
import LifeAreaServiceFactory from "../factory/services/LifeAreaServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import LifeAreaPermissions from "../permissions/LifeAreaPermissions.js";
import type {ILifeArea, ILifeAreaBase} from "../interfaces/ILifeArea";

class LifeAreaController extends AbstractFastifyController<ILifeArea, ILifeAreaBase, ILifeAreaBase>   {

    constructor() {
        super(LifeAreaServiceFactory.instance, LifeAreaPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

}

export default LifeAreaController;
export {
    LifeAreaController
}

