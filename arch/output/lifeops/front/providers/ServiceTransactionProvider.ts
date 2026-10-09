
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IServiceTransaction, IServiceTransactionBase} from '../interfaces/IServiceTransaction'

class ServiceTransactionProvider extends AbstractCrudRestProvider<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase> {

  static singleton: ServiceTransactionProvider

  constructor() {
   super('/api/service-transactions')
  }

  static get instance() {
    if(!ServiceTransactionProvider.singleton){
      ServiceTransactionProvider.singleton = new ServiceTransactionProvider()
    }
    return ServiceTransactionProvider.singleton
  }

}

export default ServiceTransactionProvider
