import DayPlanJobFactory from "../modules/lifeops/factory/services/DayPlanJobFactory.js";

interface RunDayPlanJobOptions {
    hour?: number;
    minute?: number;
    runOnStart?: boolean;
    userLimit?: number;
}

interface DayPlanJobScheduler {
    stop: () => void;
}

const DEFAULT_RUN_DAY_PLAN_JOB_OPTIONS: Required<RunDayPlanJobOptions> = {
    hour: 6,
    minute: 0,
    runOnStart: false,
    userLimit: 10000,
};

let scheduler: DayPlanJobScheduler | null = null;
let timeout: NodeJS.Timeout | null = null;
let running = false;

function RunDayPlanJob(options: RunDayPlanJobOptions = {}): DayPlanJobScheduler {
    if (scheduler) {
        return scheduler;
    }

    const resolvedOptions = resolveOptions(options);
    console.log("[day-plan-job] scheduler started", resolvedOptions);

    const scheduleNext = () => {
        const nextRunAt = calculateNextRunAt(resolvedOptions.hour, resolvedOptions.minute);
        const delayMs = Math.max(1_000, nextRunAt.getTime() - Date.now());

        console.log("[day-plan-job] next run scheduled", {
            nextRunAt: nextRunAt.toISOString(),
            delayMs,
        });

        timeout = setTimeout(() => {
            tick().finally(scheduleNext);
        }, delayMs);
    };

    const tick = async () => {
        if (running) {
            console.log("[day-plan-job] scheduler tick skipped: previous tick still running");
            return;
        }

        running = true;
        console.log("[day-plan-job] scheduler tick started");

        try {
            const results = await DayPlanJobFactory.instance.generateForAllUsers({
                date: new Date(),
                limit: resolvedOptions.userLimit,
            });

            console.log("[day-plan-job] scheduler tick finished", {
                processedUsers: results.length,
                failedUsers: results.filter(result => result.error).length,
            });
        } catch (error) {
            console.error("[day-plan-job] scheduler tick failed", {
                name: (error as any)?.name,
                message: (error as any)?.message,
                stack: (error as any)?.stack,
            });
        } finally {
            running = false;
        }
    };

    if (resolvedOptions.runOnStart) {
        tick().catch(error => console.error("[day-plan-job] scheduler start rejected", error));
    }

    scheduleNext();

    scheduler = {
        stop: () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = null;
            scheduler = null;
        },
    };

    return scheduler;
}

function resolveOptions(options: RunDayPlanJobOptions): Required<RunDayPlanJobOptions> {
    return {
        hour: options.hour ?? parseBoundedNumber(process.env.DAY_PLAN_JOB_HOUR, 0, 23) ?? DEFAULT_RUN_DAY_PLAN_JOB_OPTIONS.hour,
        minute: options.minute ?? parseBoundedNumber(process.env.DAY_PLAN_JOB_MINUTE, 0, 59) ?? DEFAULT_RUN_DAY_PLAN_JOB_OPTIONS.minute,
        runOnStart: options.runOnStart ?? (process.env.DAY_PLAN_JOB_RUN_ON_START === "true" || DEFAULT_RUN_DAY_PLAN_JOB_OPTIONS.runOnStart),
        userLimit: options.userLimit ?? parsePositiveNumber(process.env.DAY_PLAN_JOB_USER_LIMIT) ?? DEFAULT_RUN_DAY_PLAN_JOB_OPTIONS.userLimit,
    };
}

function calculateNextRunAt(hour: number, minute: number): Date {
    const nextRunAt = new Date();
    nextRunAt.setHours(hour, minute, 0, 0);

    if (nextRunAt.getTime() <= Date.now()) {
        nextRunAt.setDate(nextRunAt.getDate() + 1);
    }

    return nextRunAt;
}

function parseBoundedNumber(value: string | undefined, min: number, max: number): number | undefined {
    const numberValue = parsePositiveNumber(value);
    if (numberValue === undefined) {
        return undefined;
    }

    return numberValue >= min && numberValue <= max ? numberValue : undefined;
}

function parsePositiveNumber(value: string | undefined): number | undefined {
    if (!value) {
        return undefined;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : undefined;
}

const StartDayPlanJob = RunDayPlanJob;

export default RunDayPlanJob;
export {RunDayPlanJob, StartDayPlanJob, DEFAULT_RUN_DAY_PLAN_JOB_OPTIONS};
export type {RunDayPlanJobOptions, DayPlanJobScheduler};
