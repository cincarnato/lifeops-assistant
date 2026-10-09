
import ServiceServiceFactory from "../factory/services/ServiceServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ServicePermissions from "../permissions/ServicePermissions.js";
import type {IService, IServiceBase} from "../interfaces/IService";

class ServiceController extends AbstractFastifyController<IService, IServiceBase, IServiceBase>   {

    constructor() {
        super(ServiceServiceFactory.instance, ServicePermissions)
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

export default ServiceController;
export {
    ServiceController
}
