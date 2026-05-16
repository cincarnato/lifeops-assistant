
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IHabit, IHabitBase} from '../interfaces/IHabit'

class HabitProvider extends AbstractCrudRestProvider<IHabit, IHabitBase, IHabitBase> {
    
  static singleton: HabitProvider
    
  constructor() {
   super('/api/habits')
  }
  
  static get instance() {
    if(!HabitProvider.singleton){
      HabitProvider.singleton = new HabitProvider()
    }
    return HabitProvider.singleton
  }

}

export default HabitProvider

