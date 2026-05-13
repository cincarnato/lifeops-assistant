
import AgentJobExecutionMongoRepository from '../../repository/mongo/AgentJobExecutionMongoRepository.js'
import AgentJobExecutionSqliteRepository from '../../repository/sqlite/AgentJobExecutionSqliteRepository.js'
import type {IAgentJobExecutionRepository} from "../../interfaces/IAgentJobExecutionRepository";
import {AgentJobExecutionService} from '../../services/AgentJobExecutionService.js'
import {AgentJobExecutionBaseSchema, AgentJobExecutionSchema} from "../../schemas/AgentJobExecutionSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class AgentJobExecutionServiceFactory {
    private static service: AgentJobExecutionService;

    public static get instance(): AgentJobExecutionService {
        if (!AgentJobExecutionServiceFactory.service) {
            
            let repository: IAgentJobExecutionRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new AgentJobExecutionMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new AgentJobExecutionSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = AgentJobExecutionBaseSchema;
            const fullSchema = AgentJobExecutionSchema;
            AgentJobExecutionServiceFactory.service = new AgentJobExecutionService(repository, baseSchema, fullSchema);
        }
        return AgentJobExecutionServiceFactory.service;
    }
}

export default AgentJobExecutionServiceFactory
export {
    AgentJobExecutionServiceFactory
}

