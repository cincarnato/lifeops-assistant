
import ServiceTransactionServiceFactory from "../factory/services/ServiceTransactionServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ServiceTransactionPermissions from "../permissions/ServiceTransactionPermissions.js";
import type {IServiceTransaction, IServiceTransactionBase} from "../interfaces/IServiceTransaction";

class ServiceTransactionController extends AbstractFastifyController<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase>   {

    async generate(request, reply) {
        try {
            this.assertCreatePermission(request);
            return await ServiceTransactionServiceFactory.instance.generate(request.params.period);
        } catch (error) {
            this.handleError(error, reply);
        }
    }

    async monthly(request, reply) {
        try {
            this.assertReadPermission(request);
            return await ServiceTransactionServiceFactory.instance.monthly(request.params.period);
        } catch (error) {
            this.handleError(error, reply);
        }
    }

    assertCreatePermission(request) {
        request.rbac.assertOrPermissions([ServiceTransactionPermissions.Create, ServiceTransactionPermissions.Manage]);
    }
    assertReadPermission(request) {
        request.rbac.assertOrPermissions([ServiceTransactionPermissions.View, ServiceTransactionPermissions.Manage]);
    }
    assertUpdatePermission(request) {
        request.rbac.assertOrPermissions([ServiceTransactionPermissions.Update, ServiceTransactionPermissions.Manage]);
    }
    assertDeletePermission(request) {
        request.rbac.assertOrPermissions([ServiceTransactionPermissions.Delete, ServiceTransactionPermissions.Manage]);
    }

    constructor() {
        super(ServiceTransactionServiceFactory.instance, ServiceTransactionPermissions)
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

export default ServiceTransactionController;
export {
    ServiceTransactionController
}
