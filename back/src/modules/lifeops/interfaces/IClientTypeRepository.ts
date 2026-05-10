
import type {IClientType, IClientTypeBase} from './IClientType'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IClientTypeRepository extends IDraxCrudRepository<IClientType, IClientTypeBase, IClientTypeBase>{

}

export {IClientTypeRepository}


