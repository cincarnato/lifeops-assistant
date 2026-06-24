
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

  async generateToday(): Promise<IDayPlan> {
    return await this.httpClient.post(`${this.basePath}/generate/today`, {}) as IDayPlan
  }

  async updatePartial(id: string, data: Partial<IDayPlanBase>): Promise<IDayPlan> {
    return await super.updatePartial(id, data) as IDayPlan
  }

}

export default DayPlanProvider
