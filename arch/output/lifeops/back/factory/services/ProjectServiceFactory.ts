
import ProjectMongoRepository from '../../repository/mongo/ProjectMongoRepository.js'
import ProjectSqliteRepository from '../../repository/sqlite/ProjectSqliteRepository.js'
import type {IProjectRepository} from "../../interfaces/IProjectRepository";
import {ProjectService} from '../../services/ProjectService.js'
import {ProjectBaseSchema, ProjectSchema} from "../../schemas/ProjectSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class ProjectServiceFactory {
    private static service: ProjectService;

    public static get instance(): ProjectService {
        if (!ProjectServiceFactory.service) {
            
            let repository: IProjectRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new ProjectMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new ProjectSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = ProjectBaseSchema;
            const fullSchema = ProjectSchema;
            ProjectServiceFactory.service = new ProjectService(repository, baseSchema, fullSchema);
        }
        return ProjectServiceFactory.service;
    }
}

export default ProjectServiceFactory
export {
    ProjectServiceFactory
}

