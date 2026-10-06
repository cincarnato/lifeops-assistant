
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

}

export default TaskScheduleProvider

