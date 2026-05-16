
import PurposeMongoRepository from '../../repository/mongo/PurposeMongoRepository.js'
import PurposeSqliteRepository from '../../repository/sqlite/PurposeSqliteRepository.js'
import type {IPurposeRepository} from "../../interfaces/IPurposeRepository";
import {PurposeService} from '../../services/PurposeService.js'
import {PurposeBaseSchema, PurposeSchema} from "../../schemas/PurposeSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class PurposeServiceFactory {
    private static service: PurposeService;

    public static get instance(): PurposeService {
        if (!PurposeServiceFactory.service) {
            
            let repository: IPurposeRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new PurposeMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new PurposeSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = PurposeBaseSchema;
            const fullSchema = PurposeSchema;
            PurposeServiceFactory.service = new PurposeService(repository, baseSchema, fullSchema);
        }
        return PurposeServiceFactory.service;
    }
}

export default PurposeServiceFactory
export {
    PurposeServiceFactory
}

