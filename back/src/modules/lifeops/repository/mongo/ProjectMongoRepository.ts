
import {AbstractMongoRepository} from "@drax/crud-back";
import {ProjectModel} from "../../models/ProjectModel.js";
import type {IProjectRepository} from '../../interfaces/IProjectRepository'
import type {IProject, IProjectBase} from "../../interfaces/IProject";


class ProjectMongoRepository extends AbstractMongoRepository<IProject, IProjectBase, IProjectBase> implements IProjectRepository {

    constructor() {
        super();
        this._model = ProjectModel;
        this._searchFields = ['name', 'aliases', 'description'];
        this._populateFields = ['goals', 'client', 'user'];
        this._lean = true
    }

}

export default ProjectMongoRepository
export {ProjectMongoRepository}
