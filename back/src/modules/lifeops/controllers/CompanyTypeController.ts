
import CompanyTypeServiceFactory from "../factory/services/CompanyTypeServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CompanyTypePermissions from "../permissions/CompanyTypePermissions.js";
import type {ICompanyType, ICompanyTypeBase} from "../interfaces/ICompanyType";

class CompanyTypeController extends AbstractFastifyController<ICompanyType, ICompanyTypeBase, ICompanyTypeBase>   {

    constructor() {
        super(CompanyTypeServiceFactory.instance, CompanyTypePermissions)
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

export default CompanyTypeController;
export {
    CompanyTypeController
}

