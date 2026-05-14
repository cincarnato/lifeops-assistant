
import type {IMemory, IMemoryBase} from './IMemory'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IMemoryRepository extends IDraxCrudRepository<IMemory, IMemoryBase, IMemoryBase>{

}

export {IMemoryRepository}


