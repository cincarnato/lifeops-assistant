
import TaskPriorityMongoRepository from '../../repository/mongo/TaskPriorityMongoRepository.js'
import TaskPrioritySqliteRepository from '../../repository/sqlite/TaskPrioritySqliteRepository.js'
import type {ITaskPriorityRepository} from "../../interfaces/ITaskPriorityRepository";
import {TaskPriorityService} from '../../services/TaskPriorityService.js'
import {TaskPriorityBaseSchema, TaskPrioritySchema} from "../../schemas/TaskPrioritySchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class TaskPriorityServiceFactory {
    private static service: TaskPriorityService;

    public static get instance(): TaskPriorityService {
        if (!TaskPriorityServiceFactory.service) {
            
            let repository: ITaskPriorityRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new TaskPriorityMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new TaskPrioritySqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = TaskPriorityBaseSchema;
            const fullSchema = TaskPrioritySchema;
            TaskPriorityServiceFactory.service = new TaskPriorityService(repository, baseSchema, fullSchema);
        }
        return TaskPriorityServiceFactory.service;
    }
}

export default TaskPriorityServiceFactory
export {
    TaskPriorityServiceFactory
}

