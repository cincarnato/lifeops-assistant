
import PushDeviceMongoRepository from '../../repository/mongo/PushDeviceMongoRepository.js'
import PushDeviceSqliteRepository from '../../repository/sqlite/PushDeviceSqliteRepository.js'
import type {IPushDeviceRepository} from "../../interfaces/IPushDeviceRepository";
import {PushDeviceService} from '../../services/PushDeviceService.js'
import {PushDeviceBaseSchema, PushDeviceSchema} from "../../schemas/PushDeviceSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class PushDeviceServiceFactory {
    private static service: PushDeviceService;

    public static get instance(): PushDeviceService {
        if (!PushDeviceServiceFactory.service) {
            
            let repository: IPushDeviceRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new PushDeviceMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new PushDeviceSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = PushDeviceBaseSchema;
            const fullSchema = PushDeviceSchema;
            PushDeviceServiceFactory.service = new PushDeviceService(repository, baseSchema, fullSchema);
        }
        return PushDeviceServiceFactory.service;
    }
}

export default PushDeviceServiceFactory
export {
    PushDeviceServiceFactory
}

