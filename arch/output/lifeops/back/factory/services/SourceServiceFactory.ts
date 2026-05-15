
import SourceMongoRepository from '../../repository/mongo/SourceMongoRepository.js'
import SourceSqliteRepository from '../../repository/sqlite/SourceSqliteRepository.js'
import type {ISourceRepository} from "../../interfaces/ISourceRepository";
import {SourceService} from '../../services/SourceService.js'
import {SourceBaseSchema, SourceSchema} from "../../schemas/SourceSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class SourceServiceFactory {
    private static service: SourceService;

    public static get instance(): SourceService {
        if (!SourceServiceFactory.service) {
            
            let repository: ISourceRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new SourceMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new SourceSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = SourceBaseSchema;
            const fullSchema = SourceSchema;
            SourceServiceFactory.service = new SourceService(repository, baseSchema, fullSchema);
        }
        return SourceServiceFactory.service;
    }
}

export default SourceServiceFactory
export {
    SourceServiceFactory
}

