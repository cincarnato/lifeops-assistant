
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IAgentJob, IAgentJobBase} from '../interfaces/IAgentJob'

class AgentJobProvider extends AbstractCrudRestProvider<IAgentJob, IAgentJobBase, IAgentJobBase> {
    
  static singleton: AgentJobProvider
    
  constructor() {
   super('/api/agent-jobs')
  }
  
  static get instance() {
    if(!AgentJobProvider.singleton){
      AgentJobProvider.singleton = new AgentJobProvider()
    }
    return AgentJobProvider.singleton
  }

}

export default AgentJobProvider

