import TaskScheduleJobFactory from "../modules/lifeops/factory/services/TaskScheduleJobFactory.js";

interface RunTaskScheduleJobOptions {
    intervalMs?: number;
    runOnStart?: boolean;
    limit?: number;
}

interface TaskScheduleJobScheduler {
    stop: () => void;
}

const DEFAULT_RUN_TASK_SCHEDULE_JOB_OPTIONS: Required<RunTaskScheduleJobOptions> = {
    intervalMs: 60_000,
    runOnStart: true,
    limit: 25
};

let scheduler: TaskScheduleJobScheduler | null = null;
let running = false;

function RunTaskScheduleJob(options: RunTaskScheduleJobOptions = {}): TaskScheduleJobScheduler {
    if (scheduler) {
        return scheduler;
    }

    const resolvedOptions = resolveOptions(options);
    console.log("[task-schedule] scheduler started", resolvedOptions);

    const tick = async () => {
        if (running) {
            console.log("[task-schedule] scheduler tick skipped: previous tick still running");
            return;
        }

        running = true;

        try {
            const result = await TaskScheduleJobFactory.instance.run({
                limit: resolvedOptions.limit
            });

            console.log("[task-schedule] scheduler tick finished", {
                initialized: result.initialized,
                found: result.found,
                processed: result.processed,
                succeeded: result.succeeded,
                failed: result.failed,
                duplicates: result.duplicates
            });
        } catch (error) {
            console.error("[task-schedule] scheduler tick failed", {
                name: (error as any)?.name,
                message: (error as any)?.message,
                stack: (error as any)?.stack
            });
        } finally {
            running = false;
        }
    };

    const interval = setInterval(() => {
        tick().catch(error => console.error("[task-schedule] scheduler tick rejected", error));
    }, resolvedOptions.intervalMs);

    if (resolvedOptions.runOnStart) {
        tick().catch(error => console.error("[task-schedule] scheduler start rejected", error));
    }

    scheduler = {
        stop: () => {
            clearInterval(interval);
            scheduler = null;
        }
    };

    return scheduler;
}

function resolveOptions(options: RunTaskScheduleJobOptions): Required<RunTaskScheduleJobOptions> {
    return {
        intervalMs: options.intervalMs
            ?? parsePositiveNumber(process.env.TASK_SCHEDULE_INTERVAL_MS)
            ?? DEFAULT_RUN_TASK_SCHEDULE_JOB_OPTIONS.intervalMs,
        runOnStart: options.runOnStart ?? (process.env.TASK_SCHEDULE_RUN_ON_START !== "false" && DEFAULT_RUN_TASK_SCHEDULE_JOB_OPTIONS.runOnStart),
        limit: options.limit
            ?? parsePositiveInteger(process.env.TASK_SCHEDULE_RUN_LIMIT)
            ?? DEFAULT_RUN_TASK_SCHEDULE_JOB_OPTIONS.limit
    };
}

function parsePositiveInteger(value: string | undefined): number | undefined {
    const numberValue = parsePositiveNumber(value);
    return numberValue !== undefined ? Math.floor(numberValue) : undefined;
}

function parsePositiveNumber(value: string | undefined): number | undefined {
    if (!value) {
        return undefined;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined;
}

const StartTaskScheduleJob = RunTaskScheduleJob;

export default RunTaskScheduleJob
export {RunTaskScheduleJob, StartTaskScheduleJob, DEFAULT_RUN_TASK_SCHEDULE_JOB_OPTIONS}
export type {RunTaskScheduleJobOptions, TaskScheduleJobScheduler}
