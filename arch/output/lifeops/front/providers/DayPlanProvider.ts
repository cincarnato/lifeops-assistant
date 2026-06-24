
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IDayPlan, IDayPlanBase} from '../interfaces/IDayPlan'

class DayPlanProvider extends AbstractCrudRestProvider<IDayPlan, IDayPlanBase, IDayPlanBase> {
    
  static singleton: DayPlanProvider
    
  constructor() {
   super('/api/day-plans')
  }
  
  static get instance() {
    if(!DayPlanProvider.singleton){
      DayPlanProvider.singleton = new DayPlanProvider()
    }
    return DayPlanProvider.singleton
  }

}

export default DayPlanProvider

