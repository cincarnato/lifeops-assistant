
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IGoal, IGoalBase} from '../interfaces/IGoal'

class GoalProvider extends AbstractCrudRestProvider<IGoal, IGoalBase, IGoalBase> {
    
  static singleton: GoalProvider
    
  constructor() {
   super('/api/goals')
  }
  
  static get instance() {
    if(!GoalProvider.singleton){
      GoalProvider.singleton = new GoalProvider()
    }
    return GoalProvider.singleton
  }

}

export default GoalProvider

