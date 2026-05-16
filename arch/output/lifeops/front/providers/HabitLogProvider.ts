
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IHabitLog, IHabitLogBase} from '../interfaces/IHabitLog'

class HabitLogProvider extends AbstractCrudRestProvider<IHabitLog, IHabitLogBase, IHabitLogBase> {
    
  static singleton: HabitLogProvider
    
  constructor() {
   super('/api/habit-logs')
  }
  
  static get instance() {
    if(!HabitLogProvider.singleton){
      HabitLogProvider.singleton = new HabitLogProvider()
    }
    return HabitLogProvider.singleton
  }

}

export default HabitLogProvider

