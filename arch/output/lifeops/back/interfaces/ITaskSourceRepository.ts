
import type {ITaskSource, ITaskSourceBase} from './ITaskSource'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ITaskSourceRepository extends IDraxCrudRepository<ITaskSource, ITaskSourceBase, ITaskSourceBase>{

}

export {ITaskSourceRepository}


