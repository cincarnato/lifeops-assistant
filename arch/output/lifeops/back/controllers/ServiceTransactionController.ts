
import ServiceTransactionServiceFactory from "../factory/services/ServiceTransactionServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ServiceTransactionPermissions from "../permissions/ServiceTransactionPermissions.js";
import type {IServiceTransaction, IServiceTransactionBase} from "../interfaces/IServiceTransaction";

class ServiceTransactionController extends AbstractFastifyController<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase>   {

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
