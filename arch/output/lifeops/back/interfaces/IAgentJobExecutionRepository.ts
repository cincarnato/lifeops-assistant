
import type {IAgentJobExecution, IAgentJobExecutionBase} from './IAgentJobExecution'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IAgentJobExecutionRepository extends IDraxCrudRepository<IAgentJobExecution, IAgentJobExecutionBase, IAgentJobExecutionBase>{

}

export {IAgentJobExecutionRepository}


