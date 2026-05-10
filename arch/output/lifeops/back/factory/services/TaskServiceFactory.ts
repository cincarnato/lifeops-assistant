
import TaskMongoRepository from '../../repository/mongo/TaskMongoRepository.js'
import TaskSqliteRepository from '../../repository/sqlite/TaskSqliteRepository.js'
import type {ITaskRepository} from "../../interfaces/ITaskRepository";
import {TaskService} from '../../services/TaskService.js'
import {TaskBaseSchema, TaskSchema} from "../../schemas/TaskSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class TaskServiceFactory {
    private static service: TaskService;

    public static get instance(): TaskService {
        if (!TaskServiceFactory.service) {
            
            let repository: ITaskRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new TaskMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new TaskSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = TaskBaseSchema;
            const fullSchema = TaskSchema;
            TaskServiceFactory.service = new TaskService(repository, baseSchema, fullSchema);
        }
        return TaskServiceFactory.service;
    }
}

export default TaskServiceFactory
export {
    TaskServiceFactory
}

