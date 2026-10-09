import type { IServiceTransaction, IServiceTransactionBase } from './IServiceTransaction.js';
import type { IDraxCrudRepository } from '@drax/crud-share';


interface IServiceTransactionRepository extends IDraxCrudRepository<IServiceTransaction, IServiceTransactionBase, IServiceTransactionBase> {
    generatePending(service: string, period: string): Promise<IServiceTransaction | null>;
    assertNoDuplicatePeriods(service: string): Promise<void>;
}
export type { IServiceTransactionRepository };
