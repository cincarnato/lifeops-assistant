
import {AbstractMongoRepository} from "@drax/crud-back";
import {BusinessPartnerModel} from "../../models/BusinessPartnerModel.js";
import type {IBusinessPartnerRepository} from '../../interfaces/IBusinessPartnerRepository'
import type {IBusinessPartner, IBusinessPartnerBase} from "../../interfaces/IBusinessPartner";


class BusinessPartnerMongoRepository extends AbstractMongoRepository<IBusinessPartner, IBusinessPartnerBase, IBusinessPartnerBase> implements IBusinessPartnerRepository {

    constructor() {
        super();
        this._model = BusinessPartnerModel;
        this._searchFields = ['name', 'legalName', 'taxCondition', 'taxIdType', 'taxIdNumber', 'taxAddress', 'taxEmail', 'description', 'website', 'aliases'];
        this._populateFields = ['mainContact', 'user'];
        this._lean = true
    }

}

export default BusinessPartnerMongoRepository
export {BusinessPartnerMongoRepository}
