import type { IService, IServiceBase } from './IService.js';
import type { IDraxCrudRepository } from '@drax/crud-share';


interface IServiceRepository extends IDraxCrudRepository<IService, IServiceBase, IServiceBase> {
    readForSqliteTransaction?(id: string, db: any): Pick<IService, 'active' | 'frequency' | 'amount'>;
    withWriteLock?<T>(operation: () => Promise<T>): Promise<T>;
}
export type { IServiceRepository };
