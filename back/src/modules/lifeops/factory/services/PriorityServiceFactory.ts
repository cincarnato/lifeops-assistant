
import PriorityMongoRepository from '../../repository/mongo/PriorityMongoRepository.js'
import PrioritySqliteRepository from '../../repository/sqlite/PrioritySqliteRepository.js'
import type {IPriorityRepository} from "../../interfaces/IPriorityRepository";
import {PriorityService} from '../../services/PriorityService.js'
import {PriorityBaseSchema, PrioritySchema} from "../../schemas/PrioritySchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class PriorityServiceFactory {
    private static service: PriorityService;

    public static get instance(): PriorityService {
        if (!PriorityServiceFactory.service) {
            
            let repository: IPriorityRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new PriorityMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new PrioritySqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = PriorityBaseSchema;
            const fullSchema = PrioritySchema;
            PriorityServiceFactory.service = new PriorityService(repository, baseSchema, fullSchema);
        }
        return PriorityServiceFactory.service;
    }
}

export default PriorityServiceFactory
export {
    PriorityServiceFactory
}

