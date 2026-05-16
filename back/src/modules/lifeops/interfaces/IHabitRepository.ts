
import type {IHabit, IHabitBase} from './IHabit'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IHabitRepository extends IDraxCrudRepository<IHabit, IHabitBase, IHabitBase>{

}

export {IHabitRepository}


