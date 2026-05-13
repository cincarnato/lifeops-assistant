
import GoogleConnectionMongoRepository from '../../repository/mongo/GoogleConnectionMongoRepository.js'
import GoogleConnectionSqliteRepository from '../../repository/sqlite/GoogleConnectionSqliteRepository.js'
import type {IGoogleConnectionRepository} from "../../interfaces/IGoogleConnectionRepository";
import {GoogleConnectionService} from '../../services/GoogleConnectionService.js'
import {GoogleConnectionBaseSchema, GoogleConnectionSchema} from "../../schemas/GoogleConnectionSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class GoogleConnectionServiceFactory {
    private static service: GoogleConnectionService;

    public static get instance(): GoogleConnectionService {
        if (!GoogleConnectionServiceFactory.service) {
            
            let repository: IGoogleConnectionRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new GoogleConnectionMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new GoogleConnectionSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = GoogleConnectionBaseSchema;
            const fullSchema = GoogleConnectionSchema;
            GoogleConnectionServiceFactory.service = new GoogleConnectionService(repository, baseSchema, fullSchema);
        }
        return GoogleConnectionServiceFactory.service;
    }
}

export default GoogleConnectionServiceFactory
export {
    GoogleConnectionServiceFactory
}

