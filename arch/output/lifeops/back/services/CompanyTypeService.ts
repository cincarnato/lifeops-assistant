
import type{ICompanyTypeRepository} from "../interfaces/ICompanyTypeRepository";
import type {ICompanyTypeBase, ICompanyType} from "../interfaces/ICompanyType";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CompanyTypeService extends AbstractService<ICompanyType, ICompanyTypeBase, ICompanyTypeBase> {


    constructor(CompanyTypeRepository: ICompanyTypeRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CompanyTypeRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default CompanyTypeService
export {CompanyTypeService}
