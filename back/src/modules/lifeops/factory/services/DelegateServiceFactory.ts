import DelegateMongoRepository from '../../repository/mongo/DelegateMongoRepository.js'
import DelegateSqliteRepository from '../../repository/sqlite/DelegateSqliteRepository.js'
import type {IDelegateRepository} from "../../interfaces/IDelegateRepository";
import {DelegateService} from '../../services/DelegateService.js'
import {DelegateBaseSchema, DelegateSchema} from "../../schemas/DelegateSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class DelegateServiceFactory {
    private static service: DelegateService;

    public static get instance(): DelegateService {
        if (!DelegateServiceFactory.service) {

            let repository: IDelegateRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new DelegateMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new DelegateSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            const baseSchema = DelegateBaseSchema;
            const fullSchema = DelegateSchema;
            DelegateServiceFactory.service = new DelegateService(repository, baseSchema, fullSchema);
        }
        return DelegateServiceFactory.service;
    }
}

export default DelegateServiceFactory
export {
    DelegateServiceFactory
}
