
import type {IContact, IContactBase} from './IContact'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IContactRepository extends IDraxCrudRepository<IContact, IContactBase, IContactBase>{
    migrateBusinessPartnerReference?(): Promise<void>

}

export {IContactRepository}

