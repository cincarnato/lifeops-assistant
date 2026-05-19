
import type {IPushMessage, IPushMessageBase} from './IPushMessage'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IPushMessageRepository extends IDraxCrudRepository<IPushMessage, IPushMessageBase, IPushMessageBase>{

}

export {IPushMessageRepository}


