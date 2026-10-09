
import type{IBusinessPartnerRepository} from "../interfaces/IBusinessPartnerRepository";
import type {IBusinessPartnerBase, IBusinessPartner} from "../interfaces/IBusinessPartner";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class BusinessPartnerService extends AbstractService<IBusinessPartner, IBusinessPartnerBase, IBusinessPartnerBase> {


    constructor(BusinessPartnerRepository: IBusinessPartnerRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(BusinessPartnerRepository, baseSchema, fullSchema);

        this._validateOutput = true

    }

}

export default BusinessPartnerService
export {BusinessPartnerService}
