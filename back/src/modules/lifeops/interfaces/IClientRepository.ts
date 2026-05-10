
import type {IClient, IClientBase} from './IClient'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IClientRepository extends IDraxCrudRepository<IClient, IClientBase, IClientBase>{

}

export {IClientRepository}


