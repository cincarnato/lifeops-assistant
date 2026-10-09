
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IServiceTransaction, IServiceTransactionBase} from '../interfaces/IServiceTransaction'

class ServiceTransactionProvider extends AbstractCrudRestProvider<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase> {

  static singleton: ServiceTransactionProvider

  constructor() {
   super('/api/service-transactions')
  }

  // Drax submits the full read model, including server-managed fields.
  async create(data: IServiceTransactionBase): Promise<IServiceTransaction> {
    const {service, period, amount, status} = data
    return super.create({service, period, amount, status})
  }

  async update(id: string, data: IServiceTransactionBase): Promise<IServiceTransaction> {
    const {service, period, amount, status} = data
    return super.update(id, {service, period, amount, status})
  }

  static get instance() {
    if(!ServiceTransactionProvider.singleton){
      ServiceTransactionProvider.singleton = new ServiceTransactionProvider()
    }
    return ServiceTransactionProvider.singleton
  }

}

export default ServiceTransactionProvider
