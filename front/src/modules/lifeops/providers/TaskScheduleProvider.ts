
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITaskSchedule, ITaskScheduleBase} from '../interfaces/ITaskSchedule'

class TaskScheduleProvider extends AbstractCrudRestProvider<ITaskSchedule, ITaskScheduleBase, ITaskScheduleBase> {
    
  static singleton: TaskScheduleProvider
    
  constructor() {
   super('/api/task-schedules')
  }
  
  static get instance() {
    if(!TaskScheduleProvider.singleton){
      TaskScheduleProvider.singleton = new TaskScheduleProvider()
    }
    return TaskScheduleProvider.singleton
  }

  async create(data: ITaskScheduleBase): Promise<ITaskSchedule> {
    return super.create(this.withoutRuntime(data))
  }

  async setActive(id: string, active: boolean): Promise<ITaskSchedule> {
    return await this.httpClient.post(`${this.basePath}/${id}/${active ? 'activate' : 'deactivate'}`, {}) as ITaskSchedule
  }

  async update(id: string, data: ITaskScheduleBase): Promise<ITaskSchedule> {
    return super.update(id, this.withoutRuntime(data))
  }

  private withoutRuntime(data: ITaskScheduleBase): ITaskScheduleBase {
    const payload = {...data}
    delete payload.runtime
    return payload
  }

}

export default TaskScheduleProvider
