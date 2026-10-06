
import type {ITaskSchedule, ITaskScheduleBase} from './ITaskSchedule'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ITaskScheduleRepository extends IDraxCrudRepository<ITaskSchedule, ITaskScheduleBase, ITaskScheduleBase>{
    findDue?(now: Date, limit: number): Promise<ITaskSchedule[]>
}

export {ITaskScheduleRepository}

