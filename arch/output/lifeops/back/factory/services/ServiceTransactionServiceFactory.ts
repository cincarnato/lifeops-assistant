
import ServiceTransactionMongoRepository from '../../repository/mongo/ServiceTransactionMongoRepository.js'
import ServiceTransactionSqliteRepository from '../../repository/sqlite/ServiceTransactionSqliteRepository.js'
import type {IServiceTransactionRepository} from "../../interfaces/IServiceTransactionRepository";
import {ServiceTransactionService} from '../../services/ServiceTransactionService.js'
import {ServiceTransactionBaseSchema, ServiceTransactionSchema} from "../../schemas/ServiceTransactionSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class ServiceTransactionServiceFactory {
    private static service: ServiceTransactionService;

    public static get instance(): ServiceTransactionService {
        if (!ServiceTransactionServiceFactory.service) {

            let repository: IServiceTransactionRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new ServiceTransactionMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new ServiceTransactionSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            const baseSchema = ServiceTransactionBaseSchema;
            const fullSchema = ServiceTransactionSchema;
            ServiceTransactionServiceFactory.service = new ServiceTransactionService(repository, baseSchema, fullSchema);
        }
        return ServiceTransactionServiceFactory.service;
    }
}

export default ServiceTransactionServiceFactory
export {
    ServiceTransactionServiceFactory
}
