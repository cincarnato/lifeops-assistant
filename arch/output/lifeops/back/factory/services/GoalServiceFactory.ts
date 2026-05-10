
import GoalMongoRepository from '../../repository/mongo/GoalMongoRepository.js'
import GoalSqliteRepository from '../../repository/sqlite/GoalSqliteRepository.js'
import type {IGoalRepository} from "../../interfaces/IGoalRepository";
import {GoalService} from '../../services/GoalService.js'
import {GoalBaseSchema, GoalSchema} from "../../schemas/GoalSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class GoalServiceFactory {
    private static service: GoalService;

    public static get instance(): GoalService {
        if (!GoalServiceFactory.service) {
            
            let repository: IGoalRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new GoalMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new GoalSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = GoalBaseSchema;
            const fullSchema = GoalSchema;
            GoalServiceFactory.service = new GoalService(repository, baseSchema, fullSchema);
        }
        return GoalServiceFactory.service;
    }
}

export default GoalServiceFactory
export {
    GoalServiceFactory
}

