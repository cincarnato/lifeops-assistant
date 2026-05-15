
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ISource, ISourceBase} from '../interfaces/ISource'

class SourceProvider extends AbstractCrudRestProvider<ISource, ISourceBase, ISourceBase> {
    
  static singleton: SourceProvider
    
  constructor() {
   super('/api/sources')
  }
  
  static get instance() {
    if(!SourceProvider.singleton){
      SourceProvider.singleton = new SourceProvider()
    }
    return SourceProvider.singleton
  }

}

export default SourceProvider

