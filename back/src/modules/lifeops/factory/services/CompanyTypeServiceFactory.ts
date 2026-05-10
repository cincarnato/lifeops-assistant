
import CompanyTypeMongoRepository from '../../repository/mongo/CompanyTypeMongoRepository.js'
import CompanyTypeSqliteRepository from '../../repository/sqlite/CompanyTypeSqliteRepository.js'
import type {ICompanyTypeRepository} from "../../interfaces/ICompanyTypeRepository";
import {CompanyTypeService} from '../../services/CompanyTypeService.js'
import {CompanyTypeBaseSchema, CompanyTypeSchema} from "../../schemas/CompanyTypeSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class CompanyTypeServiceFactory {
    private static service: CompanyTypeService;

    public static get instance(): CompanyTypeService {
        if (!CompanyTypeServiceFactory.service) {
            
            let repository: ICompanyTypeRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CompanyTypeMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new CompanyTypeSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = CompanyTypeBaseSchema;
            const fullSchema = CompanyTypeSchema;
            CompanyTypeServiceFactory.service = new CompanyTypeService(repository, baseSchema, fullSchema);
        }
        return CompanyTypeServiceFactory.service;
    }
}

export default CompanyTypeServiceFactory
export {
    CompanyTypeServiceFactory
}

