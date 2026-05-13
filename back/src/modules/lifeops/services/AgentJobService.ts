
import type{IAgentJobRepository} from "../interfaces/IAgentJobRepository";
import type {IAgentJobBase, IAgentJob} from "../interfaces/IAgentJob";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class AgentJobService extends AbstractService<IAgentJob, IAgentJobBase, IAgentJobBase> {


    constructor(AgentJobRepository: IAgentJobRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(AgentJobRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default AgentJobService
export {AgentJobService}
