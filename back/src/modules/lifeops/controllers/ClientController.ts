
import ClientServiceFactory from "../factory/services/ClientServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ClientPermissions from "../permissions/ClientPermissions.js";
import type {IClient, IClientBase} from "../interfaces/IClient";

class ClientController extends AbstractFastifyController<IClient, IClientBase, IClientBase>   {

    constructor() {
        super(ClientServiceFactory.instance, ClientPermissions)
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

export default ClientController;
export {
    ClientController
}

