
import AgentJobMongoRepository from '../../repository/mongo/AgentJobMongoRepository.js'
import AgentJobSqliteRepository from '../../repository/sqlite/AgentJobSqliteRepository.js'
import type {IAgentJobRepository} from "../../interfaces/IAgentJobRepository";
import {AgentJobService} from '../../services/AgentJobService.js'
import {AgentJobBaseSchema, AgentJobSchema} from "../../schemas/AgentJobSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class AgentJobServiceFactory {
    private static service: AgentJobService;

    public static get instance(): AgentJobService {
        if (!AgentJobServiceFactory.service) {
            
            let repository: IAgentJobRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new AgentJobMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new AgentJobSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = AgentJobBaseSchema;
            const fullSchema = AgentJobSchema;
            AgentJobServiceFactory.service = new AgentJobService(repository, baseSchema, fullSchema);
        }
        return AgentJobServiceFactory.service;
    }
}

export default AgentJobServiceFactory
export {
    AgentJobServiceFactory
}

