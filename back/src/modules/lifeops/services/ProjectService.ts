
import type{IProjectRepository} from "../interfaces/IProjectRepository";
import type {IProjectBase, IProject} from "../interfaces/IProject";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ProjectService extends AbstractService<IProject, IProjectBase, IProjectBase> {


    constructor(ProjectRepository: IProjectRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ProjectRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default ProjectService
export {ProjectService}
