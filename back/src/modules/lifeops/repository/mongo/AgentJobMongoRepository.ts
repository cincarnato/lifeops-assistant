
import {AbstractMongoRepository} from "@drax/crud-back";
import {AgentJobModel} from "../../models/AgentJobModel.js";
import type {IAgentJobRepository} from '../../interfaces/IAgentJobRepository'
import type {IAgentJob, IAgentJobBase} from "../../interfaces/IAgentJob";


class AgentJobMongoRepository extends AbstractMongoRepository<IAgentJob, IAgentJobBase, IAgentJobBase> implements IAgentJobRepository {

    constructor() {
        super();
        this._model = AgentJobModel;
        this._searchFields = ['name', 'description'];
        this._populateFields = ['createdBy'];
        this._lean = true
    }

}

export default AgentJobMongoRepository
export {AgentJobMongoRepository}

