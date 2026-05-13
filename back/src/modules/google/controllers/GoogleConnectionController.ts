
import GoogleConnectionServiceFactory from "../factory/services/GoogleConnectionServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import GoogleConnectionPermissions from "../permissions/GoogleConnectionPermissions.js";
import type {IGoogleConnection, IGoogleConnectionBase} from "../interfaces/IGoogleConnection";

class GoogleConnectionController extends AbstractFastifyController<IGoogleConnection, IGoogleConnectionBase, IGoogleConnectionBase>   {

    constructor() {
        super(GoogleConnectionServiceFactory.instance, GoogleConnectionPermissions)
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

export default GoogleConnectionController;
export {
    GoogleConnectionController
}

