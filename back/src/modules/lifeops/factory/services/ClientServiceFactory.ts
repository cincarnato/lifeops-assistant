
import ClientMongoRepository from '../../repository/mongo/ClientMongoRepository.js'
import ClientSqliteRepository from '../../repository/sqlite/ClientSqliteRepository.js'
import type {IClientRepository} from "../../interfaces/IClientRepository";
import {ClientService} from '../../services/ClientService.js'
import {ClientBaseSchema, ClientSchema} from "../../schemas/ClientSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class ClientServiceFactory {
    private static service: ClientService;

    public static get instance(): ClientService {
        if (!ClientServiceFactory.service) {
            
            let repository: IClientRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new ClientMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new ClientSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = ClientBaseSchema;
            const fullSchema = ClientSchema;
            ClientServiceFactory.service = new ClientService(repository, baseSchema, fullSchema);
        }
        return ClientServiceFactory.service;
    }
}

export default ClientServiceFactory
export {
    ClientServiceFactory
}

