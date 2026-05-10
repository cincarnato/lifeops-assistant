
import type {ITaskStatus, ITaskStatusBase} from './ITaskStatus'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ITaskStatusRepository extends IDraxCrudRepository<ITaskStatus, ITaskStatusBase, ITaskStatusBase>{

}

export {ITaskStatusRepository}


