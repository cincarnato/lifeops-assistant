
import PushDeviceServiceFactory from "../factory/services/PushDeviceServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import PushDevicePermissions from "../permissions/PushDevicePermissions.js";
import type {IPushDevice, IPushDeviceBase} from "../interfaces/IPushDevice";

class PushDeviceController extends AbstractFastifyController<IPushDevice, IPushDeviceBase, IPushDeviceBase>   {

    constructor() {
        super(PushDeviceServiceFactory.instance, PushDevicePermissions)
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

export default PushDeviceController;
export {
    PushDeviceController
}

