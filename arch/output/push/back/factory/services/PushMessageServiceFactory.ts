
import PushMessageMongoRepository from '../../repository/mongo/PushMessageMongoRepository.js'
import PushMessageSqliteRepository from '../../repository/sqlite/PushMessageSqliteRepository.js'
import type {IPushMessageRepository} from "../../interfaces/IPushMessageRepository";
import {PushMessageService} from '../../services/PushMessageService.js'
import {PushMessageBaseSchema, PushMessageSchema} from "../../schemas/PushMessageSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class PushMessageServiceFactory {
    private static service: PushMessageService;

    public static get instance(): PushMessageService {
        if (!PushMessageServiceFactory.service) {
            
            let repository: IPushMessageRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new PushMessageMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new PushMessageSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = PushMessageBaseSchema;
            const fullSchema = PushMessageSchema;
            PushMessageServiceFactory.service = new PushMessageService(repository, baseSchema, fullSchema);
        }
        return PushMessageServiceFactory.service;
    }
}

export default PushMessageServiceFactory
export {
    PushMessageServiceFactory
}

