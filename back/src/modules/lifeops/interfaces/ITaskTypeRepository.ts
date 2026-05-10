
import type {ITaskType, ITaskTypeBase} from './ITaskType'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ITaskTypeRepository extends IDraxCrudRepository<ITaskType, ITaskTypeBase, ITaskTypeBase>{

}

export {ITaskTypeRepository}


