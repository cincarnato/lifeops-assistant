
import LifeAreaMongoRepository from '../../repository/mongo/LifeAreaMongoRepository.js'
import LifeAreaSqliteRepository from '../../repository/sqlite/LifeAreaSqliteRepository.js'
import type {ILifeAreaRepository} from "../../interfaces/ILifeAreaRepository";
import {LifeAreaService} from '../../services/LifeAreaService.js'
import {LifeAreaBaseSchema, LifeAreaSchema} from "../../schemas/LifeAreaSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class LifeAreaServiceFactory {
    private static service: LifeAreaService;

    public static get instance(): LifeAreaService {
        if (!LifeAreaServiceFactory.service) {
            
            let repository: ILifeAreaRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new LifeAreaMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new LifeAreaSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = LifeAreaBaseSchema;
            const fullSchema = LifeAreaSchema;
            LifeAreaServiceFactory.service = new LifeAreaService(repository, baseSchema, fullSchema);
        }
        return LifeAreaServiceFactory.service;
    }
}

export default LifeAreaServiceFactory
export {
    LifeAreaServiceFactory
}

