
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITask, ITaskBase} from '../interfaces/ITask'

class TaskProvider extends AbstractCrudRestProvider<ITask, ITaskBase, ITaskBase> {
    
  static singleton: TaskProvider
    
  constructor() {
   super('/api/tasks')
  }
  
  static get instance() {
    if(!TaskProvider.singleton){
      TaskProvider.singleton = new TaskProvider()
    }
    return TaskProvider.singleton
  }

  async triage(id: string): Promise<ITask> {
    return await this.httpClient.post(`${this.basePath}/${id}/triage`, {}, {timeout: 120000}) as ITask
  }

}

export default TaskProvider
