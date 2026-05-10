
import ContactMongoRepository from '../../repository/mongo/ContactMongoRepository.js'
import ContactSqliteRepository from '../../repository/sqlite/ContactSqliteRepository.js'
import type {IContactRepository} from "../../interfaces/IContactRepository";
import {ContactService} from '../../services/ContactService.js'
import {ContactBaseSchema, ContactSchema} from "../../schemas/ContactSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class ContactServiceFactory {
    private static service: ContactService;

    public static get instance(): ContactService {
        if (!ContactServiceFactory.service) {
            
            let repository: IContactRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new ContactMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new ContactSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = ContactBaseSchema;
            const fullSchema = ContactSchema;
            ContactServiceFactory.service = new ContactService(repository, baseSchema, fullSchema);
        }
        return ContactServiceFactory.service;
    }
}

export default ContactServiceFactory
export {
    ContactServiceFactory
}

