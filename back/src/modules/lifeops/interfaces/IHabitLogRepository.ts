
import type {IHabitLog, IHabitLogBase} from './IHabitLog'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IHabitLogRepository extends IDraxCrudRepository<IHabitLog, IHabitLogBase, IHabitLogBase>{

}

export {IHabitLogRepository}


