
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IBusinessPartner, IBusinessPartnerBase} from '../interfaces/IBusinessPartner'

class BusinessPartnerProvider extends AbstractCrudRestProvider<IBusinessPartner, IBusinessPartnerBase, IBusinessPartnerBase> {

  static singleton: BusinessPartnerProvider

  constructor() {
   super('/api/business-partners')
  }

  static get instance() {
    if(!BusinessPartnerProvider.singleton){
      BusinessPartnerProvider.singleton = new BusinessPartnerProvider()
    }
    return BusinessPartnerProvider.singleton
  }

}

export default BusinessPartnerProvider
