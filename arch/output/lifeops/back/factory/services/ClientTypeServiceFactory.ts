
import ClientTypeMongoRepository from '../../repository/mongo/ClientTypeMongoRepository.js'
import ClientTypeSqliteRepository from '../../repository/sqlite/ClientTypeSqliteRepository.js'
import type {IClientTypeRepository} from "../../interfaces/IClientTypeRepository";
import {ClientTypeService} from '../../services/ClientTypeService.js'
import {ClientTypeBaseSchema, ClientTypeSchema} from "../../schemas/ClientTypeSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class ClientTypeServiceFactory {
    private static service: ClientTypeService;

    public static get instance(): ClientTypeService {
        if (!ClientTypeServiceFactory.service) {
            
            let repository: IClientTypeRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new ClientTypeMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new ClientTypeSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = ClientTypeBaseSchema;
            const fullSchema = ClientTypeSchema;
            ClientTypeServiceFactory.service = new ClientTypeService(repository, baseSchema, fullSchema);
        }
        return ClientTypeServiceFactory.service;
    }
}

export default ClientTypeServiceFactory
export {
    ClientTypeServiceFactory
}

