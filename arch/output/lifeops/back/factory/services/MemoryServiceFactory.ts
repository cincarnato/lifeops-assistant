
import MemoryMongoRepository from '../../repository/mongo/MemoryMongoRepository.js'
import MemorySqliteRepository from '../../repository/sqlite/MemorySqliteRepository.js'
import type {IMemoryRepository} from "../../interfaces/IMemoryRepository";
import {MemoryService} from '../../services/MemoryService.js'
import {MemoryBaseSchema, MemorySchema} from "../../schemas/MemorySchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class MemoryServiceFactory {
    private static service: MemoryService;

    public static get instance(): MemoryService {
        if (!MemoryServiceFactory.service) {
            
            let repository: IMemoryRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new MemoryMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new MemorySqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = MemoryBaseSchema;
            const fullSchema = MemorySchema;
            MemoryServiceFactory.service = new MemoryService(repository, baseSchema, fullSchema);
        }
        return MemoryServiceFactory.service;
    }
}

export default MemoryServiceFactory
export {
    MemoryServiceFactory
}

