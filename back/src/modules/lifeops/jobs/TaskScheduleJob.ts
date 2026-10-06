import type {TaskScheduleService} from "../services/TaskScheduleService.js";
import type {TaskScheduleExecutionResult} from "../services/TaskScheduleService.js";

interface TaskScheduleJobOptions {
    now?: Date
    limit?: number
}

interface TaskScheduleJobResult {
    initialized: number
    found: number
    processed: number
    succeeded: number
    failed: number
    duplicates: number
    results: TaskScheduleExecutionResult[]
}

const DEFAULT_TASK_SCHEDULE_JOB_OPTIONS: Required<Omit<TaskScheduleJobOptions, "now">> = {
    limit: 25
};

class TaskScheduleJob {
    constructor(private readonly taskScheduleService: TaskScheduleService) {
    }

    public async run(options: TaskScheduleJobOptions = {}): Promise<TaskScheduleJobResult> {
        const now = options.now ?? new Date()
        const limit = options.limit ?? DEFAULT_TASK_SCHEDULE_JOB_OPTIONS.limit
        const initialized = await this.taskScheduleService.initializeMissingNextRunAt(now, limit)
        const schedules = await this.taskScheduleService.findDue(now, limit)

        console.log("[task-schedule] runner scan", {
            now: now.toISOString(),
            initializedSchedules: initialized,
            dueSchedules: schedules.length,
            limit
        })

        if (schedules.length > 0) {
            console.log("[task-schedule] due schedules found", schedules.map(schedule => ({
                taskScheduleId: schedule._id,
                name: schedule.name,
                nextRunAt: schedule.runtime?.nextRunAt ? new Date(schedule.runtime.nextRunAt).toISOString() : null
            })))
        }

        const result: TaskScheduleJobResult = {
            initialized,
            found: schedules.length,
            processed: 0,
            succeeded: 0,
            failed: 0,
            duplicates: 0,
            results: []
        }

        for (const schedule of schedules) {
            const execution = await this.taskScheduleService.executeDueSchedule(schedule, now)
            result.processed += 1
            result.succeeded += execution.status === "success" ? 1 : 0
            result.failed += execution.status === "failed" ? 1 : 0
            result.duplicates += execution.duplicate ? 1 : 0
            result.results.push(execution)
        }

        return result
    }
}

export default TaskScheduleJob
export {TaskScheduleJob, DEFAULT_TASK_SCHEDULE_JOB_OPTIONS}
export type {TaskScheduleJobOptions, TaskScheduleJobResult}
