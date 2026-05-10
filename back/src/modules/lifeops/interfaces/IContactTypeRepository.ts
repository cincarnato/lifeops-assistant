
import type {IContactType, IContactTypeBase} from './IContactType'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IContactTypeRepository extends IDraxCrudRepository<IContactType, IContactTypeBase, IContactTypeBase>{

}

export {IContactTypeRepository}


