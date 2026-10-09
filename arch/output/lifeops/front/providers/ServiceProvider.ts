
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IService, IServiceBase} from '../interfaces/IService'

class ServiceProvider extends AbstractCrudRestProvider<IService, IServiceBase, IServiceBase> {

  static singleton: ServiceProvider

  constructor() {
   super('/api/services')
  }

  static get instance() {
    if(!ServiceProvider.singleton){
      ServiceProvider.singleton = new ServiceProvider()
    }
    return ServiceProvider.singleton
  }

}

export default ServiceProvider
