
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

}

export default TaskProvider

