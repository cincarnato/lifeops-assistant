
import TaskStatusMongoRepository from '../../repository/mongo/TaskStatusMongoRepository.js'
import TaskStatusSqliteRepository from '../../repository/sqlite/TaskStatusSqliteRepository.js'
import type {ITaskStatusRepository} from "../../interfaces/ITaskStatusRepository";
import {TaskStatusService} from '../../services/TaskStatusService.js'
import {TaskStatusBaseSchema, TaskStatusSchema} from "../../schemas/TaskStatusSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class TaskStatusServiceFactory {
    private static service: TaskStatusService;

    public static get instance(): TaskStatusService {
        if (!TaskStatusServiceFactory.service) {
            
            let repository: ITaskStatusRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new TaskStatusMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new TaskStatusSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = TaskStatusBaseSchema;
            const fullSchema = TaskStatusSchema;
            TaskStatusServiceFactory.service = new TaskStatusService(repository, baseSchema, fullSchema);
        }
        return TaskStatusServiceFactory.service;
    }
}

export default TaskStatusServiceFactory
export {
    TaskStatusServiceFactory
}

