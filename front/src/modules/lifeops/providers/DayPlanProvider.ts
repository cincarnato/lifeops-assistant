
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

  async planning(date: string): Promise<IDayPlan | null> {
    return await this.httpClient.get(`${this.basePath}/planning`, {params: {date}}) as IDayPlan | null
  }

  async generate(date: string): Promise<IDayPlan> {
    return await this.httpClient.post(`${this.basePath}/generate`, {date}) as IDayPlan
  }

  async availableSlots(date: string): Promise<{slots: Array<{startAt: string; endAt: string}>}> {
    return await this.httpClient.get(`${this.basePath}/available-slots`, {params: {date, utcOffsetMinutes: new Date(`${date}T12:00:00`).getTimezoneOffset()}}) as {slots: Array<{startAt: string; endAt: string}>}
  }

  async scheduleTask(id: string, taskId: string, startAt: string): Promise<IDayPlan> {
    return await this.httpClient.post(`${this.basePath}/${id}/schedule-task`, {taskId, startAt, utcOffsetMinutes: new Date(startAt).getTimezoneOffset()}) as IDayPlan
  }

  async create(data: IDayPlanBase): Promise<IDayPlan> {
    return super.create(this.serialize(data) as IDayPlanBase)
  }

  async update(id: string, data: IDayPlanBase): Promise<IDayPlan> {
    return super.update(id, this.serialize(data) as IDayPlanBase)
  }

  async updatePartial(id: string, data: Partial<IDayPlanBase>): Promise<IDayPlan> {
    return super.updatePartial(id, this.serialize(data))
  }

  private serialize(data: Partial<IDayPlanBase>): Partial<IDayPlanBase> {
    const id = (value: unknown) => value && typeof value === "object" && "_id" in value ? value._id : value
    const result: Partial<IDayPlanBase> = {}
    for (const key of ['date', 'status', 'events'] as const) {
      if (key in data) Object.assign(result, {[key]: data[key]})
    }
    if (data.tasks) result.tasks = data.tasks.map(entry => ({task: id(entry.task), decision: entry.decision, priority: entry.priority ?? null}))
    if (data.habits) result.habits = data.habits.map(entry => ({habit: id(entry.habit), decision: entry.decision}))
    if (data.suggestions) result.suggestions = data.suggestions.map(entry => ({title: entry.title, decision: entry.decision, goal: id(entry.goal), project: id(entry.project)}))
    return result
  }

}

export default DayPlanProvider
