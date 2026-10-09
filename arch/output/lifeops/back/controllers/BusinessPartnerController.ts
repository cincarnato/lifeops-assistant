
import BusinessPartnerServiceFactory from "../factory/services/BusinessPartnerServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import BusinessPartnerPermissions from "../permissions/BusinessPartnerPermissions.js";
import type {IBusinessPartner, IBusinessPartnerBase} from "../interfaces/IBusinessPartner";

class BusinessPartnerController extends AbstractFastifyController<IBusinessPartner, IBusinessPartnerBase, IBusinessPartnerBase>   {

    constructor() {
        super(BusinessPartnerServiceFactory.instance, BusinessPartnerPermissions)
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

export default BusinessPartnerController;
export {
    BusinessPartnerController
}
