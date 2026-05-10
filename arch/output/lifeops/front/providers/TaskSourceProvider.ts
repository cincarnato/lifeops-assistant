
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITaskSource, ITaskSourceBase} from '../interfaces/ITaskSource'

class TaskSourceProvider extends AbstractCrudRestProvider<ITaskSource, ITaskSourceBase, ITaskSourceBase> {
    
  static singleton: TaskSourceProvider
    
  constructor() {
   super('/api/task-sources')
  }
  
  static get instance() {
    if(!TaskSourceProvider.singleton){
      TaskSourceProvider.singleton = new TaskSourceProvider()
    }
    return TaskSourceProvider.singleton
  }

}

export default TaskSourceProvider

