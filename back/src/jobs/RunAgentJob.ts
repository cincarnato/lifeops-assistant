import AgentJobFactory from "../modules/lifeops/factory/services/AgentJobFactory.js";

interface RunAgentJobOptions {
    intervalMs?: number;
    runOnStart?: boolean;
    limit?: number;
}

interface AgentJobScheduler {
    stop: () => void;
}

const DEFAULT_RUN_AGENT_JOB_OPTIONS: Required<RunAgentJobOptions> = {
    intervalMs: 60_000,
    runOnStart: true,
    limit: 25
};

let scheduler: AgentJobScheduler | null = null;
let running = false;

function RunAgentJob(options: RunAgentJobOptions = {}): AgentJobScheduler {
    if (scheduler) {
        return scheduler;
    }

    const resolvedOptions = resolveOptions(options);
    console.log("[agent-job] scheduler started", resolvedOptions);

    const tick = async () => {
        if (running) {
            console.log("[agent-job] scheduler tick skipped: previous tick still running");
            return;
        }

        running = true;
        console.log("[agent-job] scheduler tick started", {
            limit: resolvedOptions.limit
        });

        try {
            const results = await AgentJobFactory.instance.runDueJobs({
                limit: resolvedOptions.limit
            });

            console.log("[agent-job] scheduler tick finished", {
                processedJobs: results.length,
                executions: results.map(result => ({
                    jobId: result.job._id,
                    jobName: result.job.name,
                    executionId: result.execution._id,
                    status: result.execution.status
                }))
            });
        } catch (error) {
            console.error("[agent-job] scheduler tick failed", {
                name: error?.name,
                message: error?.message,
                stack: error?.stack
            });
        } finally {
            running = false;
        }
    };

    const interval = setInterval(() => {
        tick().catch(error => console.error("[agent-job] scheduler tick rejected", error));
    }, resolvedOptions.intervalMs);

    if (resolvedOptions.runOnStart) {
        tick().catch(error => console.error("[agent-job] scheduler start rejected", error));
    }

    scheduler = {
        stop: () => {
            clearInterval(interval);
            scheduler = null;
        }
    };

    return scheduler;
}

function resolveOptions(options: RunAgentJobOptions): Required<RunAgentJobOptions> {
    return {
        intervalMs: options.intervalMs
            ?? parsePositiveNumber(process.env.AGENT_JOB_INTERVAL_MS)
            ?? DEFAULT_RUN_AGENT_JOB_OPTIONS.intervalMs,
        runOnStart: options.runOnStart ?? DEFAULT_RUN_AGENT_JOB_OPTIONS.runOnStart,
        limit: options.limit
            ?? parsePositiveNumber(process.env.AGENT_JOB_RUN_LIMIT)
            ?? DEFAULT_RUN_AGENT_JOB_OPTIONS.limit
    };
}

function parsePositiveNumber(value: string | undefined): number | undefined {
    if (!value) {
        return undefined;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined;
}

const StartAgentJob = RunAgentJob;

export default RunAgentJob
export {RunAgentJob, StartAgentJob, DEFAULT_RUN_AGENT_JOB_OPTIONS}
export type {RunAgentJobOptions, RunAgentJobOptions as StartAgentJobOptions, AgentJobScheduler}
