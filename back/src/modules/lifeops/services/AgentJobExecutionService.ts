
import type{IAgentJobExecutionRepository} from "../interfaces/IAgentJobExecutionRepository";
import type {IAgentJobExecutionBase, IAgentJobExecution} from "../interfaces/IAgentJobExecution";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class AgentJobExecutionService extends AbstractService<IAgentJobExecution, IAgentJobExecutionBase, IAgentJobExecutionBase> {


    constructor(AgentJobExecutionRepository: IAgentJobExecutionRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(AgentJobExecutionRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default AgentJobExecutionService
export {AgentJobExecutionService}
