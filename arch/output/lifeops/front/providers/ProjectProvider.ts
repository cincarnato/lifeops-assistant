
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IProject, IProjectBase} from '../interfaces/IProject'

class ProjectProvider extends AbstractCrudRestProvider<IProject, IProjectBase, IProjectBase> {
    
  static singleton: ProjectProvider
    
  constructor() {
   super('/api/projects')
  }
  
  static get instance() {
    if(!ProjectProvider.singleton){
      ProjectProvider.singleton = new ProjectProvider()
    }
    return ProjectProvider.singleton
  }

}

export default ProjectProvider

