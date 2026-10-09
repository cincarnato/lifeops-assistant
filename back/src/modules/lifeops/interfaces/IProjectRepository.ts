
import type {IProject, IProjectBase} from './IProject'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IProjectRepository extends IDraxCrudRepository<IProject, IProjectBase, IProjectBase>{
    migrateBusinessPartnerReference?(): Promise<void>

}

export {IProjectRepository}

