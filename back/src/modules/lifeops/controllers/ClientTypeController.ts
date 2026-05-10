
import ClientTypeServiceFactory from "../factory/services/ClientTypeServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ClientTypePermissions from "../permissions/ClientTypePermissions.js";
import type {IClientType, IClientTypeBase} from "../interfaces/IClientType";

class ClientTypeController extends AbstractFastifyController<IClientType, IClientTypeBase, IClientTypeBase>   {

    constructor() {
        super(ClientTypeServiceFactory.instance, ClientTypePermissions)
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

export default ClientTypeController;
export {
    ClientTypeController
}

