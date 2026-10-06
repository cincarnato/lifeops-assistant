
import type{IAgentJobExecutionRepository} from "../interfaces/IAgentJobExecutionRepository";
import type {IAgentJobExecutionBase, IAgentJobExecution} from "../interfaces/IAgentJobExecution";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class AgentJobExecutionService extends AbstractService<IAgentJobExecution, IAgentJobExecutionBase, IAgentJobExecutionBase> {


    constructor(AgentJobExecutionRepository: IAgentJobExecutionRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(AgentJobExecutionRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

    async findByScheduledOccurrence(jobId: string, scheduledFor: Date): Promise<IAgentJobExecution | null> {
        if (!this.repository.findByScheduledOccurrence) {
            throw new Error("agentJobExecution.scheduledOccurrence.repositoryUnsupported")
        }

        return this.repository.findByScheduledOccurrence(jobId, scheduledFor)
    }

    private get repository(): IAgentJobExecutionRepository {
        return this._repository as IAgentJobExecutionRepository
    }

}

export default AgentJobExecutionService
export {AgentJobExecutionService}
