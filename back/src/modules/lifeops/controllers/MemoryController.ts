
import MemoryServiceFactory from "../factory/services/MemoryServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import MemoryPermissions from "../permissions/MemoryPermissions.js";
import type {IMemory, IMemoryBase} from "../interfaces/IMemory";

class MemoryController extends AbstractFastifyController<IMemory, IMemoryBase, IMemoryBase>   {

    constructor() {
        super(MemoryServiceFactory.instance, MemoryPermissions)
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

export default MemoryController;
export {
    MemoryController
}

