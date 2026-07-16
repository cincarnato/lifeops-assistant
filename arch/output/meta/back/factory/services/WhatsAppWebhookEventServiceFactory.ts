
import WhatsAppWebhookEventMongoRepository from '../../repository/mongo/WhatsAppWebhookEventMongoRepository.js'
import WhatsAppWebhookEventSqliteRepository from '../../repository/sqlite/WhatsAppWebhookEventSqliteRepository.js'
import type {IWhatsAppWebhookEventRepository} from "../../interfaces/IWhatsAppWebhookEventRepository";
import {WhatsAppWebhookEventService} from '../../services/WhatsAppWebhookEventService.js'
import {WhatsAppWebhookEventBaseSchema, WhatsAppWebhookEventSchema} from "../../schemas/WhatsAppWebhookEventSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class WhatsAppWebhookEventServiceFactory {
    private static service: WhatsAppWebhookEventService;

    public static get instance(): WhatsAppWebhookEventService {
        if (!WhatsAppWebhookEventServiceFactory.service) {
            
            let repository: IWhatsAppWebhookEventRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new WhatsAppWebhookEventMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new WhatsAppWebhookEventSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = WhatsAppWebhookEventBaseSchema;
            const fullSchema = WhatsAppWebhookEventSchema;
            WhatsAppWebhookEventServiceFactory.service = new WhatsAppWebhookEventService(repository, baseSchema, fullSchema);
        }
        return WhatsAppWebhookEventServiceFactory.service;
    }
}

export default WhatsAppWebhookEventServiceFactory
export {
    WhatsAppWebhookEventServiceFactory
}

