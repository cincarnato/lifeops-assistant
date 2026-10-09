
import ServiceMongoRepository from '../../repository/mongo/ServiceMongoRepository.js'
import ServiceSqliteRepository from '../../repository/sqlite/ServiceSqliteRepository.js'
import type {IServiceRepository} from "../../interfaces/IServiceRepository";
import {ServiceService} from '../../services/ServiceService.js'
import {ServiceBaseSchema, ServiceSchema} from "../../schemas/ServiceSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class ServiceServiceFactory {
    private static service: ServiceService;

    public static get instance(): ServiceService {
        if (!ServiceServiceFactory.service) {

            let repository: IServiceRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new ServiceMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new ServiceSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            const baseSchema = ServiceBaseSchema;
            const fullSchema = ServiceSchema;
            ServiceServiceFactory.service = new ServiceService(repository, baseSchema, fullSchema);
        }
        return ServiceServiceFactory.service;
    }
}

export default ServiceServiceFactory
export {
    ServiceServiceFactory
}
