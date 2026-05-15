
import type {ISource, ISourceBase} from './ISource'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ISourceRepository extends IDraxCrudRepository<ISource, ISourceBase, ISourceBase>{

}

export {ISourceRepository}


