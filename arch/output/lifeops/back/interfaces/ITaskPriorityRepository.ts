
import type {ITaskPriority, ITaskPriorityBase} from './ITaskPriority'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ITaskPriorityRepository extends IDraxCrudRepository<ITaskPriority, ITaskPriorityBase, ITaskPriorityBase>{

}

export {ITaskPriorityRepository}


