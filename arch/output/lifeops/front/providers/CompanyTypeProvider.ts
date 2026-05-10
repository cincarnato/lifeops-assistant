
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICompanyType, ICompanyTypeBase} from '../interfaces/ICompanyType'

class CompanyTypeProvider extends AbstractCrudRestProvider<ICompanyType, ICompanyTypeBase, ICompanyTypeBase> {
    
  static singleton: CompanyTypeProvider
    
  constructor() {
   super('/api/company-types')
  }
  
  static get instance() {
    if(!CompanyTypeProvider.singleton){
      CompanyTypeProvider.singleton = new CompanyTypeProvider()
    }
    return CompanyTypeProvider.singleton
  }

}

export default CompanyTypeProvider

