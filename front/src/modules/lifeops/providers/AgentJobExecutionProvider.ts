
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IAgentJobExecution, IAgentJobExecutionBase} from '../interfaces/IAgentJobExecution'

class AgentJobExecutionProvider extends AbstractCrudRestProvider<IAgentJobExecution, IAgentJobExecutionBase, IAgentJobExecutionBase> {
    
  static singleton: AgentJobExecutionProvider
    
  constructor() {
   super('/api/agent-job-executions')
  }
  
  static get instance() {
    if(!AgentJobExecutionProvider.singleton){
      AgentJobExecutionProvider.singleton = new AgentJobExecutionProvider()
    }
    return AgentJobExecutionProvider.singleton
  }

}

export default AgentJobExecutionProvider

