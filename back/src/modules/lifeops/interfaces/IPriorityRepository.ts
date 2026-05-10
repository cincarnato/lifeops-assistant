
import type {IPriority, IPriorityBase} from './IPriority'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IPriorityRepository extends IDraxCrudRepository<IPriority, IPriorityBase, IPriorityBase>{

}

export {IPriorityRepository}


