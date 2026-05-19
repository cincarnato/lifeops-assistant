
import type{IProjectRepository} from "../interfaces/IProjectRepository";
import type {IProjectBase, IProject} from "../interfaces/IProject";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class ProjectService extends AbstractService<IProject, IProjectBase, IProjectBase> {


    constructor(ProjectRepository: IProjectRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(ProjectRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.transformCreate = this.normalizeCreateData.bind(this)
        
    }

    private async normalizeCreateData(data: IProjectBase): Promise<IProjectBase> {
        return {
            ...data,
            name: this.capitalizeFirstLetter(data.name)
        }
    }

    private capitalizeFirstLetter(value: string): string {
        if (!value) return value
        return value.charAt(0).toLocaleUpperCase('es') + value.slice(1)
    }

}

export default ProjectService
export {ProjectService}
