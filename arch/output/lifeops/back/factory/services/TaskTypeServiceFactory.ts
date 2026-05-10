
import TaskTypeMongoRepository from '../../repository/mongo/TaskTypeMongoRepository.js'
import TaskTypeSqliteRepository from '../../repository/sqlite/TaskTypeSqliteRepository.js'
import type {ITaskTypeRepository} from "../../interfaces/ITaskTypeRepository";
import {TaskTypeService} from '../../services/TaskTypeService.js'
import {TaskTypeBaseSchema, TaskTypeSchema} from "../../schemas/TaskTypeSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class TaskTypeServiceFactory {
    private static service: TaskTypeService;

    public static get instance(): TaskTypeService {
        if (!TaskTypeServiceFactory.service) {
            
            let repository: ITaskTypeRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new TaskTypeMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new TaskTypeSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = TaskTypeBaseSchema;
            const fullSchema = TaskTypeSchema;
            TaskTypeServiceFactory.service = new TaskTypeService(repository, baseSchema, fullSchema);
        }
        return TaskTypeServiceFactory.service;
    }
}

export default TaskTypeServiceFactory
export {
    TaskTypeServiceFactory
}

