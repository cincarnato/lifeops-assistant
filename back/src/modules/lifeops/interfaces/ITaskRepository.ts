
import type {ITask, ITaskBase} from './ITask'
import type {IDraxCrudRepository, IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";

interface ITaskRepository extends IDraxCrudRepository<ITask, ITaskBase, ITaskBase>{
    migrateBusinessPartnerReference?(): Promise<void>
    paginateArchived?(options: IDraxPaginateOptions): Promise<IDraxPaginateResult<ITask>>
    findArchivedById?(id: string): Promise<ITask | null>
    findPendingArchiveBatch?(cutoff: Date, limit: number): Promise<ITask[]>
    archiveTask?(task: ITask, migratedAt?: Date): Promise<void>
    findByScheduleOccurrence?(taskScheduleId: string, scheduledFor: Date): Promise<ITask | null>
}

export {ITaskRepository}
