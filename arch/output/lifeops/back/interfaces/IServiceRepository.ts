
import type {IService, IServiceBase} from './IService'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IServiceRepository extends IDraxCrudRepository<IService, IServiceBase, IServiceBase>{

}

export {IServiceRepository}
