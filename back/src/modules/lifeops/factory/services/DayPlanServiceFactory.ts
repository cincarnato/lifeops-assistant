
import DayPlanMongoRepository from '../../repository/mongo/DayPlanMongoRepository.js'
import DayPlanSqliteRepository from '../../repository/sqlite/DayPlanSqliteRepository.js'
import type {IDayPlanRepository} from "../../interfaces/IDayPlanRepository";
import {DayPlanService} from '../../services/DayPlanService.js'
import {DayPlanBaseSchema, DayPlanSchema} from "../../schemas/DayPlanSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class DayPlanServiceFactory {
    private static service: DayPlanService;

    public static get instance(): DayPlanService {
        if (!DayPlanServiceFactory.service) {
            
            let repository: IDayPlanRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new DayPlanMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new DayPlanSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = DayPlanBaseSchema;
            const fullSchema = DayPlanSchema;
            DayPlanServiceFactory.service = new DayPlanService(repository, baseSchema, fullSchema);
        }
        return DayPlanServiceFactory.service;
    }
}

export default DayPlanServiceFactory
export {
    DayPlanServiceFactory
}

