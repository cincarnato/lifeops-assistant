
import {AbstractMongoRepository} from "@drax/crud-back";
import {CompanyTypeModel} from "../../models/CompanyTypeModel.js";
import type {ICompanyTypeRepository} from '../../interfaces/ICompanyTypeRepository'
import type {ICompanyType, ICompanyTypeBase} from "../../interfaces/ICompanyType";


class CompanyTypeMongoRepository extends AbstractMongoRepository<ICompanyType, ICompanyTypeBase, ICompanyTypeBase> implements ICompanyTypeRepository {

    constructor() {
        super();
        this._model = CompanyTypeModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = [];
        this._lean = true
    }

}

export default CompanyTypeMongoRepository
export {CompanyTypeMongoRepository}

