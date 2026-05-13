
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

}

export default AgentJobExecutionMongoRepository
export {AgentJobExecutionMongoRepository}

