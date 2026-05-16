
import HabitLogMongoRepository from '../../repository/mongo/HabitLogMongoRepository.js'
import HabitLogSqliteRepository from '../../repository/sqlite/HabitLogSqliteRepository.js'
import type {IHabitLogRepository} from "../../interfaces/IHabitLogRepository";
import {HabitLogService} from '../../services/HabitLogService.js'
import {HabitLogBaseSchema, HabitLogSchema} from "../../schemas/HabitLogSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class HabitLogServiceFactory {
    private static service: HabitLogService;

    public static get instance(): HabitLogService {
        if (!HabitLogServiceFactory.service) {
            
            let repository: IHabitLogRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new HabitLogMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new HabitLogSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = HabitLogBaseSchema;
            const fullSchema = HabitLogSchema;
            HabitLogServiceFactory.service = new HabitLogService(repository, baseSchema, fullSchema);
        }
        return HabitLogServiceFactory.service;
    }
}

export default HabitLogServiceFactory
export {
    HabitLogServiceFactory
}

