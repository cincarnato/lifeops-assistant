
import type {IGoal, IGoalBase} from './IGoal'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IGoalRepository extends IDraxCrudRepository<IGoal, IGoalBase, IGoalBase>{

}

export {IGoalRepository}


