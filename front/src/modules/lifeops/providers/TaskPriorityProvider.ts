
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITaskPriority, ITaskPriorityBase} from '../interfaces/ITaskPriority'

class TaskPriorityProvider extends AbstractCrudRestProvider<ITaskPriority, ITaskPriorityBase, ITaskPriorityBase> {
    
  static singleton: TaskPriorityProvider
    
  constructor() {
   super('/api/task-priorities')
  }
  
  static get instance() {
    if(!TaskPriorityProvider.singleton){
      TaskPriorityProvider.singleton = new TaskPriorityProvider()
    }
    return TaskPriorityProvider.singleton
  }

}

export default TaskPriorityProvider

