
import type{IBusinessPartnerRepository} from "../interfaces/IBusinessPartnerRepository";
import type {IBusinessPartnerBase, IBusinessPartner} from "../interfaces/IBusinessPartner";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class BusinessPartnerService extends AbstractService<IBusinessPartner, IBusinessPartnerBase, IBusinessPartnerBase> {


    constructor(BusinessPartnerRepository: IBusinessPartnerRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(BusinessPartnerRepository, baseSchema, fullSchema);

        this._validateOutput = true
        this.transformCreate = this.normalizeCreateData.bind(this)

    }

    async migrateLegacyClients(): Promise<void> {
        await (this._repository as IBusinessPartnerRepository).migrateLegacyClients?.()
    }

    private async normalizeCreateData(data: IBusinessPartnerBase): Promise<IBusinessPartnerBase> {
        return {
            ...data,
            name: this.capitalizeFirstLetter(data.name)
        }
    }

    private capitalizeFirstLetter(value: string): string {
        if (!value) return value
        return value.charAt(0).toLocaleUpperCase('es') + value.slice(1)
    }

}

export default BusinessPartnerService
export {BusinessPartnerService}
