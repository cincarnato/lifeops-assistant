
import type{ICompanyRepository} from "../interfaces/ICompanyRepository";
import type {ICompanyBase, ICompany} from "../interfaces/ICompany";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CompanyService extends AbstractService<ICompany, ICompanyBase, ICompanyBase> {


    constructor(CompanyRepository: ICompanyRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CompanyRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.transformCreate = this.normalizeCreateData.bind(this)
        
    }

    private async normalizeCreateData(data: ICompanyBase): Promise<ICompanyBase> {
        return {
            ...data,
            name: this.capitalizeFirstLetter(data.name),
            legalName: this.capitalizeFirstLetter(data.legalName)
        }
    }

    private capitalizeFirstLetter(value?: string): string | undefined {
        if (!value) return value
        return value.charAt(0).toLocaleUpperCase('es') + value.slice(1)
    }

}

export default CompanyService
export {CompanyService}
