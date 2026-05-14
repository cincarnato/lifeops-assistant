
import MemoryTypeServiceFactory from "../factory/services/MemoryTypeServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import MemoryTypePermissions from "../permissions/MemoryTypePermissions.js";
import type {IMemoryType, IMemoryTypeBase} from "../interfaces/IMemoryType";

class MemoryTypeController extends AbstractFastifyController<IMemoryType, IMemoryTypeBase, IMemoryTypeBase>   {

    constructor() {
        super(MemoryTypeServiceFactory.instance, MemoryTypePermissions)
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

export default MemoryTypeController;
export {
    MemoryTypeController
}

