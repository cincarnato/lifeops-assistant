
import ContactTypeMongoRepository from '../../repository/mongo/ContactTypeMongoRepository.js'
import ContactTypeSqliteRepository from '../../repository/sqlite/ContactTypeSqliteRepository.js'
import type {IContactTypeRepository} from "../../interfaces/IContactTypeRepository";
import {ContactTypeService} from '../../services/ContactTypeService.js'
import {ContactTypeBaseSchema, ContactTypeSchema} from "../../schemas/ContactTypeSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class ContactTypeServiceFactory {
    private static service: ContactTypeService;

    public static get instance(): ContactTypeService {
        if (!ContactTypeServiceFactory.service) {
            
            let repository: IContactTypeRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new ContactTypeMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new ContactTypeSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = ContactTypeBaseSchema;
            const fullSchema = ContactTypeSchema;
            ContactTypeServiceFactory.service = new ContactTypeService(repository, baseSchema, fullSchema);
        }
        return ContactTypeServiceFactory.service;
    }
}

export default ContactTypeServiceFactory
export {
    ContactTypeServiceFactory
}

