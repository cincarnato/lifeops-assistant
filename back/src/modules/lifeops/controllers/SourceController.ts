
import SourceServiceFactory from "../factory/services/SourceServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import SourcePermissions from "../permissions/SourcePermissions.js";
import type {ISource, ISourceBase} from "../interfaces/ISource";

class SourceController extends AbstractFastifyController<ISource, ISourceBase, ISourceBase>   {

    constructor() {
        super(SourceServiceFactory.instance, SourcePermissions)
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

export default SourceController;
export {
    SourceController
}

