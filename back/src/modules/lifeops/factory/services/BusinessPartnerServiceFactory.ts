
import BusinessPartnerMongoRepository from '../../repository/mongo/BusinessPartnerMongoRepository.js'
import BusinessPartnerSqliteRepository from '../../repository/sqlite/BusinessPartnerSqliteRepository.js'
import type {IBusinessPartnerRepository} from "../../interfaces/IBusinessPartnerRepository";
import {BusinessPartnerService} from '../../services/BusinessPartnerService.js'
import {BusinessPartnerBaseSchema, BusinessPartnerSchema} from "../../schemas/BusinessPartnerSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class BusinessPartnerServiceFactory {
    private static service: BusinessPartnerService;

    public static get instance(): BusinessPartnerService {
        if (!BusinessPartnerServiceFactory.service) {

            let repository: IBusinessPartnerRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new BusinessPartnerMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new BusinessPartnerSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            const baseSchema = BusinessPartnerBaseSchema;
            const fullSchema = BusinessPartnerSchema;
            BusinessPartnerServiceFactory.service = new BusinessPartnerService(repository, baseSchema, fullSchema);
        }
        return BusinessPartnerServiceFactory.service;
    }
}

export default BusinessPartnerServiceFactory
export {
    BusinessPartnerServiceFactory
}
