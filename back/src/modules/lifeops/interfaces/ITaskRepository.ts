
import type {ITask, ITaskBase} from './ITask'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ITaskRepository extends IDraxCrudRepository<ITask, ITaskBase, ITaskBase>{

}

export {ITaskRepository}


