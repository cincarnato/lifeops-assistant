
import InstructionMongoRepository from '../../repository/mongo/InstructionMongoRepository.js'
import InstructionSqliteRepository from '../../repository/sqlite/InstructionSqliteRepository.js'
import type {IInstructionRepository} from "../../interfaces/IInstructionRepository";
import {InstructionService} from '../../services/InstructionService.js'
import {InstructionBaseSchema, InstructionSchema} from "../../schemas/InstructionSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class InstructionServiceFactory {
    private static service: InstructionService;

    public static get instance(): InstructionService {
        if (!InstructionServiceFactory.service) {

            let repository: IInstructionRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new InstructionMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new InstructionSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            const baseSchema = InstructionBaseSchema;
            const fullSchema = InstructionSchema;
            InstructionServiceFactory.service = new InstructionService(repository, baseSchema, fullSchema);
        }
        return InstructionServiceFactory.service;
    }
}

export default InstructionServiceFactory
export {
    InstructionServiceFactory
}
