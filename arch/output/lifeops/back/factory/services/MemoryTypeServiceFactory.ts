
import MemoryTypeMongoRepository from '../../repository/mongo/MemoryTypeMongoRepository.js'
import MemoryTypeSqliteRepository from '../../repository/sqlite/MemoryTypeSqliteRepository.js'
import type {IMemoryTypeRepository} from "../../interfaces/IMemoryTypeRepository";
import {MemoryTypeService} from '../../services/MemoryTypeService.js'
import {MemoryTypeBaseSchema, MemoryTypeSchema} from "../../schemas/MemoryTypeSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class MemoryTypeServiceFactory {
    private static service: MemoryTypeService;

    public static get instance(): MemoryTypeService {
        if (!MemoryTypeServiceFactory.service) {
            
            let repository: IMemoryTypeRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new MemoryTypeMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new MemoryTypeSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = MemoryTypeBaseSchema;
            const fullSchema = MemoryTypeSchema;
            MemoryTypeServiceFactory.service = new MemoryTypeService(repository, baseSchema, fullSchema);
        }
        return MemoryTypeServiceFactory.service;
    }
}

export default MemoryTypeServiceFactory
export {
    MemoryTypeServiceFactory
}

