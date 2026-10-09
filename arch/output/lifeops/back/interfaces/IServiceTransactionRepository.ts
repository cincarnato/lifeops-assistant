
import type {IServiceTransaction, IServiceTransactionBase} from './IServiceTransaction'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IServiceTransactionRepository extends IDraxCrudRepository<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase>{

}

export {IServiceTransactionRepository}
