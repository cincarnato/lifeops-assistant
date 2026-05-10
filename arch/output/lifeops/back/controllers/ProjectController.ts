
import ProjectServiceFactory from "../factory/services/ProjectServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import ProjectPermissions from "../permissions/ProjectPermissions.js";
import type {IProject, IProjectBase} from "../interfaces/IProject";

class ProjectController extends AbstractFastifyController<IProject, IProjectBase, IProjectBase>   {

    constructor() {
        super(ProjectServiceFactory.instance, ProjectPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

}

export default ProjectController;
export {
    ProjectController
}

