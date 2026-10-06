
import TaskScheduleMongoRepository from '../../repository/mongo/TaskScheduleMongoRepository.js'
import TaskScheduleSqliteRepository from '../../repository/sqlite/TaskScheduleSqliteRepository.js'
import type {ITaskScheduleRepository} from "../../interfaces/ITaskScheduleRepository";
import {TaskScheduleService} from '../../services/TaskScheduleService.js'
import {TaskScheduleBaseSchema, TaskScheduleSchema} from "../../schemas/TaskScheduleSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class TaskScheduleServiceFactory {
    private static service: TaskScheduleService;

    public static get instance(): TaskScheduleService {
        if (!TaskScheduleServiceFactory.service) {
            
            let repository: ITaskScheduleRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new TaskScheduleMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new TaskScheduleSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = TaskScheduleBaseSchema;
            const fullSchema = TaskScheduleSchema;
            TaskScheduleServiceFactory.service = new TaskScheduleService(repository, baseSchema, fullSchema);
        }
        return TaskScheduleServiceFactory.service;
    }
}

export default TaskScheduleServiceFactory
export {
    TaskScheduleServiceFactory
}

