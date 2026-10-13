import type {IDelegate, IDelegateBase} from './IDelegate'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IDelegateRepository extends IDraxCrudRepository<IDelegate, IDelegateBase, IDelegateBase>{

}

export {IDelegateRepository}
