
import type {IPurpose, IPurposeBase} from './IPurpose'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IPurposeRepository extends IDraxCrudRepository<IPurpose, IPurposeBase, IPurposeBase>{

}

export {IPurposeRepository}


