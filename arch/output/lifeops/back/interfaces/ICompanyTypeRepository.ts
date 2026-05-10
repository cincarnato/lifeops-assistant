
import type {ICompanyType, ICompanyTypeBase} from './ICompanyType'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ICompanyTypeRepository extends IDraxCrudRepository<ICompanyType, ICompanyTypeBase, ICompanyTypeBase>{

}

export {ICompanyTypeRepository}


