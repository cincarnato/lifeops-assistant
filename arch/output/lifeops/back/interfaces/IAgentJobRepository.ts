
import type {IAgentJob, IAgentJobBase} from './IAgentJob'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IAgentJobRepository extends IDraxCrudRepository<IAgentJob, IAgentJobBase, IAgentJobBase>{

}

export {IAgentJobRepository}


