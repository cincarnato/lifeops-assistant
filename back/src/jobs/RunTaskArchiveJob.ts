import TaskArchiveJobFactory from "../modules/lifeops/factory/services/TaskArchiveJobFactory.js";

interface RunTaskArchiveJobOptions {
    intervalMs?: number;
    runOnStart?: boolean;
    archiveAfterHours?: number;
    batchSize?: number;
}

interface TaskArchiveJobScheduler {
    stop: () => void;
}

const DEFAULT_RUN_TASK_ARCHIVE_JOB_OPTIONS: Required<RunTaskArchiveJobOptions> = {
    intervalMs: 60 * 60 * 1000,
    runOnStart: true,
    archiveAfterHours: 72,
    batchSize: 100
};

let scheduler: TaskArchiveJobScheduler | null = null;
let running = false;

function RunTaskArchiveJob(options: RunTaskArchiveJobOptions = {}): TaskArchiveJobScheduler {
    if (scheduler) {
        return scheduler;
    }

    const resolvedOptions = resolveOptions(options);
    console.log("[task-archive-job] scheduler started", resolvedOptions);

    const tick = async () => {
        if (running) {
            console.log("[task-archive-job] scheduler tick skipped: previous tick still running");
            return;
        }

        running = true;

        try {
            await TaskArchiveJobFactory.instance.run({
                archiveAfterHours: resolvedOptions.archiveAfterHours,
                batchSize: resolvedOptions.batchSize
            });
        } catch (error) {
            console.error("[task-archive-job] scheduler tick failed", {
                name: (error as any)?.name,
                message: (error as any)?.message,
                stack: (error as any)?.stack
            });
        } finally {
            running = false;
        }
    };

    const interval = setInterval(() => {
        tick().catch(error => console.error("[task-archive-job] scheduler tick rejected", error));
    }, resolvedOptions.intervalMs);

    if (resolvedOptions.runOnStart) {
        tick().catch(error => console.error("[task-archive-job] scheduler start rejected", error));
    }

    scheduler = {
        stop: () => {
            clearInterval(interval);
            scheduler = null;
        }
    };

    return scheduler;
}

function resolveOptions(options: RunTaskArchiveJobOptions): Required<RunTaskArchiveJobOptions> {
    return {
        intervalMs: options.intervalMs
            ?? parsePositiveNumber(process.env.TASK_ARCHIVE_INTERVAL_MS)
            ?? parseCronIntervalMs(process.env.TASK_ARCHIVE_CRON)
            ?? DEFAULT_RUN_TASK_ARCHIVE_JOB_OPTIONS.intervalMs,
        runOnStart: options.runOnStart ?? (process.env.TASK_ARCHIVE_RUN_ON_START !== "false" && DEFAULT_RUN_TASK_ARCHIVE_JOB_OPTIONS.runOnStart),
        archiveAfterHours: options.archiveAfterHours
            ?? parsePositiveNumber(process.env.TASK_ARCHIVE_AFTER_HOURS)
            ?? DEFAULT_RUN_TASK_ARCHIVE_JOB_OPTIONS.archiveAfterHours,
        batchSize: options.batchSize
            ?? parsePositiveInteger(process.env.TASK_ARCHIVE_BATCH_SIZE)
            ?? DEFAULT_RUN_TASK_ARCHIVE_JOB_OPTIONS.batchSize
    };
}

function parseCronIntervalMs(value: string | undefined): number | undefined {
    if (!value || value.trim() !== "0 * * * *") {
        return undefined;
    }

    return 60 * 60 * 1000;
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

const StartTaskArchiveJob = RunTaskArchiveJob;

export default RunTaskArchiveJob
export {RunTaskArchiveJob, StartTaskArchiveJob, DEFAULT_RUN_TASK_ARCHIVE_JOB_OPTIONS}
export type {RunTaskArchiveJobOptions, TaskArchiveJobScheduler}
