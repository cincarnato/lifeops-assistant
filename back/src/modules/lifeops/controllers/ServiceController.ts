
import ServiceServiceFactory from "../factory/services/ServiceServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ServicePermissions from "../permissions/ServicePermissions.js";
import type {IService, IServiceBase} from "../interfaces/IService";

class ServiceController extends AbstractFastifyController<IService, IServiceBase, IServiceBase>   {

    assertCreatePermission(request) {
        request.rbac.assertOrPermissions([ServicePermissions.Create, ServicePermissions.Manage]);
    }
    assertReadPermission(request) {
        request.rbac.assertOrPermissions([ServicePermissions.View, ServicePermissions.Manage]);
    }
    assertUpdatePermission(request) {
        request.rbac.assertOrPermissions([ServicePermissions.Update, ServicePermissions.Manage]);
    }
    assertDeletePermission(request) {
        request.rbac.assertOrPermissions([ServicePermissions.Delete, ServicePermissions.Manage]);
    }

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
