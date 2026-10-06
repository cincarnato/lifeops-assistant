
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

    async findDue(now: Date, limit: number): Promise<IAgentJob[]> {
        return AgentJobModel
            .find({
                active: true,
                "runtime.nextRunAt": {$lte: now}
            })
            .sort({"runtime.nextRunAt": 1, _id: 1})
            .limit(limit)
            .populate(this._populateFields)
            .lean(this._lean)
            .exec() as Promise<IAgentJob[]>
    }

}

export default AgentJobMongoRepository
export {AgentJobMongoRepository}
