
import type {IMemoryType, IMemoryTypeBase} from './IMemoryType'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IMemoryTypeRepository extends IDraxCrudRepository<IMemoryType, IMemoryTypeBase, IMemoryTypeBase>{

}

export {IMemoryTypeRepository}


