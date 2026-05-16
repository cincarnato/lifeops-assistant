
import HabitMongoRepository from '../../repository/mongo/HabitMongoRepository.js'
import HabitSqliteRepository from '../../repository/sqlite/HabitSqliteRepository.js'
import type {IHabitRepository} from "../../interfaces/IHabitRepository";
import {HabitService} from '../../services/HabitService.js'
import {HabitBaseSchema, HabitSchema} from "../../schemas/HabitSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class HabitServiceFactory {
    private static service: HabitService;

    public static get instance(): HabitService {
        if (!HabitServiceFactory.service) {
            
            let repository: IHabitRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new HabitMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new HabitSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = HabitBaseSchema;
            const fullSchema = HabitSchema;
            HabitServiceFactory.service = new HabitService(repository, baseSchema, fullSchema);
        }
        return HabitServiceFactory.service;
    }
}

export default HabitServiceFactory
export {
    HabitServiceFactory
}

