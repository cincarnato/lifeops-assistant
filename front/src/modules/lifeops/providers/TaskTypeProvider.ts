
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITaskType, ITaskTypeBase} from '../interfaces/ITaskType'

class TaskTypeProvider extends AbstractCrudRestProvider<ITaskType, ITaskTypeBase, ITaskTypeBase> {
    
  static singleton: TaskTypeProvider
    
  constructor() {
   super('/api/task-types')
  }
  
  static get instance() {
    if(!TaskTypeProvider.singleton){
      TaskTypeProvider.singleton = new TaskTypeProvider()
    }
    return TaskTypeProvider.singleton
  }

}

export default TaskTypeProvider

