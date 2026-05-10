
import TaskSourceMongoRepository from '../../repository/mongo/TaskSourceMongoRepository.js'
import TaskSourceSqliteRepository from '../../repository/sqlite/TaskSourceSqliteRepository.js'
import type {ITaskSourceRepository} from "../../interfaces/ITaskSourceRepository";
import {TaskSourceService} from '../../services/TaskSourceService.js'
import {TaskSourceBaseSchema, TaskSourceSchema} from "../../schemas/TaskSourceSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class TaskSourceServiceFactory {
    private static service: TaskSourceService;

    public static get instance(): TaskSourceService {
        if (!TaskSourceServiceFactory.service) {
            
            let repository: ITaskSourceRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new TaskSourceMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new TaskSourceSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = TaskSourceBaseSchema;
            const fullSchema = TaskSourceSchema;
            TaskSourceServiceFactory.service = new TaskSourceService(repository, baseSchema, fullSchema);
        }
        return TaskSourceServiceFactory.service;
    }
}

export default TaskSourceServiceFactory
export {
    TaskSourceServiceFactory
}

