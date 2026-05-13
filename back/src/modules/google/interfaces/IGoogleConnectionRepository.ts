
import type {IGoogleConnection, IGoogleConnectionBase} from './IGoogleConnection'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IGoogleConnectionRepository extends IDraxCrudRepository<IGoogleConnection, IGoogleConnectionBase, IGoogleConnectionBase>{

}

export {IGoogleConnectionRepository}


