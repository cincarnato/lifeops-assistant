
import type{ICompanyRepository} from "../interfaces/ICompanyRepository";
import type {ICompanyBase, ICompany} from "../interfaces/ICompany";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CompanyService extends AbstractService<ICompany, ICompanyBase, ICompanyBase> {


    constructor(CompanyRepository: ICompanyRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CompanyRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default CompanyService
export {CompanyService}
