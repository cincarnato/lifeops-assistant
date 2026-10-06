
import {AbstractMongoRepository} from "@drax/crud-back";
import {AgentJobExecutionModel} from "../../models/AgentJobExecutionModel.js";
import type {IAgentJobExecutionRepository} from '../../interfaces/IAgentJobExecutionRepository'
import type {IAgentJobExecution, IAgentJobExecutionBase} from "../../interfaces/IAgentJobExecution";


class AgentJobExecutionMongoRepository extends AbstractMongoRepository<IAgentJobExecution, IAgentJobExecutionBase, IAgentJobExecutionBase> implements IAgentJobExecutionRepository {

    constructor() {
        super();
        this._model = AgentJobExecutionModel;
        this._searchFields = [];
        this._populateFields = ['jobId'];
        this._lean = true
    }

    async findByScheduledOccurrence(jobId: string, scheduledFor: Date): Promise<IAgentJobExecution | null> {
        return AgentJobExecutionModel
            .findOne({jobId, trigger: "scheduled", scheduledFor})
            .populate(this._populateFields)
            .lean(this._lean)
            .exec() as Promise<IAgentJobExecution | null>
    }

}

export default AgentJobExecutionMongoRepository
export {AgentJobExecutionMongoRepository}
