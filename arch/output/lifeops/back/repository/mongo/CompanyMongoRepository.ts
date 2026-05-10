
import {AbstractMongoRepository} from "@drax/crud-back";
import {CompanyModel} from "../../models/CompanyModel.js";
import type {ICompanyRepository} from '../../interfaces/ICompanyRepository'
import type {ICompany, ICompanyBase} from "../../interfaces/ICompany";


class CompanyMongoRepository extends AbstractMongoRepository<ICompany, ICompanyBase, ICompanyBase> implements ICompanyRepository {

    constructor() {
        super();
        this._model = CompanyModel;
        this._searchFields = ['name', 'legalName', 'taxIdType', 'taxIdNumber', 'description', 'website'];
        this._populateFields = ['user'];
        this._lean = true
    }

}

export default CompanyMongoRepository
export {CompanyMongoRepository}

