
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITaskStatus, ITaskStatusBase} from '../interfaces/ITaskStatus'

class TaskStatusProvider extends AbstractCrudRestProvider<ITaskStatus, ITaskStatusBase, ITaskStatusBase> {
    
  static singleton: TaskStatusProvider
    
  constructor() {
   super('/api/task-statuses')
  }
  
  static get instance() {
    if(!TaskStatusProvider.singleton){
      TaskStatusProvider.singleton = new TaskStatusProvider()
    }
    return TaskStatusProvider.singleton
  }

}

export default TaskStatusProvider

