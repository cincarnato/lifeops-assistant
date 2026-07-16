
import WhatsAppPhoneNumberMongoRepository from '../../repository/mongo/WhatsAppPhoneNumberMongoRepository.js'
import WhatsAppPhoneNumberSqliteRepository from '../../repository/sqlite/WhatsAppPhoneNumberSqliteRepository.js'
import type {IWhatsAppPhoneNumberRepository} from "../../interfaces/IWhatsAppPhoneNumberRepository";
import {WhatsAppPhoneNumberService} from '../../services/WhatsAppPhoneNumberService.js'
import {WhatsAppPhoneNumberBaseSchema, WhatsAppPhoneNumberSchema} from "../../schemas/WhatsAppPhoneNumberSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class WhatsAppPhoneNumberServiceFactory {
    private static service: WhatsAppPhoneNumberService;

    public static get instance(): WhatsAppPhoneNumberService {
        if (!WhatsAppPhoneNumberServiceFactory.service) {
            
            let repository: IWhatsAppPhoneNumberRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new WhatsAppPhoneNumberMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new WhatsAppPhoneNumberSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = WhatsAppPhoneNumberBaseSchema;
            const fullSchema = WhatsAppPhoneNumberSchema;
            WhatsAppPhoneNumberServiceFactory.service = new WhatsAppPhoneNumberService(repository, baseSchema, fullSchema);
        }
        return WhatsAppPhoneNumberServiceFactory.service;
    }
}

export default WhatsAppPhoneNumberServiceFactory
export {
    WhatsAppPhoneNumberServiceFactory
}

