import {DraxAgent} from "@drax/ai-back";
import type {DraxAgentMessageOutput} from "@drax/ai-back";
import type {IAgentJob} from "../interfaces/IAgentJob.js";
import type {IAgentJobExecution, IAgentJobExecutionBase} from "../interfaces/IAgentJobExecution.js";
import AgentConfigService from "./AgentConfigService.js";
import type {AgentJobService} from "./AgentJobService.js";
import type {AgentJobExecutionService} from "./AgentJobExecutionService.js";

type AgentJobExecutionTrigger = "scheduled" | "manual" | "retry";
type AgentJobExecutionStatus = "success" | "failed" | "timeout";

interface AgentJobRunOptions {
    trigger?: AgentJobExecutionTrigger;
    scheduledFor?: Date;
    userId?: string | null;
    tenantId?: string | null;
    ip?: string;
    userAgent?: string;
    attempt?: number;
}

interface AgentJobRunDueOptions {
    now?: Date;
    limit?: number;
}

interface AgentJobRunDueResult {
    job: IAgentJob;
    execution: IAgentJobExecution;
}

type DraxAgentConstructor = new () => DraxAgent;
type AgentJobToolCall = NonNullable<IAgentJobExecutionBase["toolCalls"]>[number];

class AgentJobTimeoutError extends Error {
    constructor(timeoutSeconds: number) {
        super(`agent.job.timeout.${timeoutSeconds}`);
        this.name = "AgentJobTimeoutError";
    }
}

class AgentJobRunnerService {
    constructor(
        private readonly jobService: AgentJobService,
        private readonly executionService: AgentJobExecutionService,
    ) {
    }

    public async runDueJobs(options: AgentJobRunDueOptions = {}): Promise<AgentJobRunDueResult[]> {
        const now = options.now ?? new Date();
        const limit = options.limit ?? 25;
        const allJobs = await this.jobService.fetchAll();
        const jobs = allJobs
            .filter(job => this.isDue(job, now))
            .sort((a, b) => this.resolveDueDate(a, now).getTime() - this.resolveDueDate(b, now).getTime())
            .slice(0, limit);

        console.log("[agent-job] runner scan", {
            now: now.toISOString(),
            totalJobs: allJobs.length,
            dueJobs: jobs.length,
            limit
        });

        if (jobs.length > 0) {
            console.log("[agent-job] due jobs found", jobs.map(job => ({
                jobId: this.stringifyId(job),
                name: job.name,
                nextRunAt: this.resolveDate(job.runtime?.nextRunAt)?.toISOString() ?? null
            })));
        }

        const results: AgentJobRunDueResult[] = [];

        for (const job of jobs) {
            results.push({
                job,
                execution: await this.executeJob(job, {
                    trigger: "scheduled",
                    scheduledFor: this.resolveDate(job.runtime?.nextRunAt) ?? now
                })
            });
        }

        return results;
    }

    public async executeJob(jobOrId: string | IAgentJob, options: AgentJobRunOptions = {}): Promise<IAgentJobExecution> {
        const job = typeof jobOrId === "string" ? await this.jobService.findById(jobOrId) : jobOrId;

        if (!job) {
            throw new Error("agent.job.notFound");
        }

        if (job.active === false) {
            throw new Error("agent.job.inactive");
        }

        const maxRetries = Math.max(0, job.execution?.maxRetries ?? 0);
        let attempt = options.attempt ?? 1;
        let lastExecution: IAgentJobExecution | null = null;

        while (attempt <= maxRetries + 1) {
            lastExecution = await this.executeAttempt(job, {
                ...options,
                trigger: attempt === 1 ? options.trigger ?? "manual" : "retry",
                attempt
            });

            if (lastExecution.status === "success") {
                return lastExecution;
            }

            attempt++;
        }

        return lastExecution as IAgentJobExecution;
    }

    private async executeAttempt(job: IAgentJob, options: AgentJobRunOptions): Promise<IAgentJobExecution> {
        const startedAt = new Date();
        const toolCalls: AgentJobToolCall[] = [];
        const execution = await this.executionService.create({
            jobId: this.stringifyId(job),
            status: "running",
            trigger: options.trigger ?? "manual",
            scheduledFor: options.scheduledFor,
            startedAt,
            attempt: options.attempt ?? 1,
            promptSnapshot: {
                systemPrompt: job.agent.systemPrompt,
                allowedTools: job.agent.allowedTools ?? []
            },
            toolCalls: []
        });

        console.log("[agent-job] execution started", {
            jobId: this.stringifyId(job),
            jobName: job.name,
            executionId: this.stringifyId(execution),
            trigger: options.trigger ?? "manual",
            attempt: options.attempt ?? 1,
            startedAt: startedAt.toISOString()
        });

        try {
            const response = await this.runAgent(job, execution, options, toolCalls);
            const finishedExecution = await this.finishExecution(execution, "success", startedAt, {
                toolCalls,
                result: {
                    summary: response.message,
                    data: this.normalizeRecord(response.output),
                    outcome: response.message
                },
                usage: {
                    inputTokens: response.inputTokens,
                    outputTokens: response.outputTokens,
                    totalTokens: response.tokens
                }
            });

            await this.updateJobRuntime(job, "success", startedAt);
            console.log("[agent-job] execution finished", {
                jobId: this.stringifyId(job),
                jobName: job.name,
                executionId: this.stringifyId(finishedExecution),
                status: finishedExecution.status,
                durationMs: finishedExecution.durationMs
            });
            return finishedExecution;
        } catch (error) {
            const status: AgentJobExecutionStatus = error instanceof AgentJobTimeoutError ? "timeout" : "failed";
            const finishedExecution = await this.finishExecution(execution, status, startedAt, {
                toolCalls,
                error: {
                    code: this.resolveErrorCode(error),
                    message: this.resolveErrorMessage(error)
                }
            });

            await this.updateJobRuntime(job, status, startedAt);
            console.log("[agent-job] execution finished", {
                jobId: this.stringifyId(job),
                jobName: job.name,
                executionId: this.stringifyId(finishedExecution),
                status: finishedExecution.status,
                durationMs: finishedExecution.durationMs,
                error: this.resolveErrorMessage(error)
            });
            return finishedExecution;
        }
    }

    private async runAgent(
        job: IAgentJob,
        execution: IAgentJobExecution,
        options: AgentJobRunOptions,
        toolCalls: AgentJobToolCall[],
    ): Promise<DraxAgentMessageOutput> {
        await AgentConfigService.instance.prepare();

        const agent = new (DraxAgent as unknown as DraxAgentConstructor)();
        agent.configure({
            ...AgentConfigService.instance.buildJobAgentConfig({
                ...job.agent,
                onToolCall: toolCall => {
                    toolCalls.push(this.normalizeToolCall(toolCall));
                }
            }),
            historyLimit: 0,
            operationGroup: "lifeops-agent-job",
            operationTitle: `agent-job:${job.name}`,
            sessionService: false,
            toolMaxIterations: 10
        });

        const timeoutSeconds = job.execution?.timeoutSeconds ?? 300;

        return await this.withTimeout(agent.sendMessage({
            sessionId: `agent-job-${this.stringifyId(job)}-${this.stringifyId(execution)}`,
            userId: options.userId ?? this.stringifyRelationId(job.createdBy),
            tenantId: options.tenantId ?? null,
            message: this.buildJobMessage(job, execution, options),
            ip: options.ip,
            userAgent: options.userAgent,
            operationGroup: "lifeops-agent-job",
            operationTitle: `agent-job:${job.name}`
        }), timeoutSeconds);
    }

    private async finishExecution(
        execution: IAgentJobExecution,
        status: AgentJobExecutionStatus,
        startedAt: Date,
        payload: Partial<IAgentJobExecutionBase>,
    ): Promise<IAgentJobExecution> {
        const finishedAt = new Date();

        return await this.executionService.updatePartial(this.stringifyId(execution), {
            status,
            finishedAt,
            durationMs: finishedAt.getTime() - startedAt.getTime(),
            ...payload
        });
    }

    private async updateJobRuntime(job: IAgentJob, status: AgentJobExecutionStatus, lastRunAt: Date): Promise<void> {
        await this.jobService.updatePartial(this.stringifyId(job), {
            runtime: {
                ...(job.runtime ?? {}),
                lastRunAt,
                lastStatus: status,
                nextRunAt: this.calculateNextRunAt(job, lastRunAt)
            }
        });
    }

    private buildJobMessage(job: IAgentJob, execution: IAgentJobExecution, options: AgentJobRunOptions): string {
        return [
            `Ejecuta el job "${job.name}".`,
            job.description ? `Descripcion: ${job.description}` : "",
            `Trigger: ${options.trigger ?? "manual"}.`,
            options.scheduledFor ? `Programado para: ${options.scheduledFor.toISOString()}.` : "",
            `ExecutionId: ${this.stringifyId(execution)}.`,
            "",
            "Usa las tools disponibles solo si hacen falta para cumplir el objetivo del job."
        ].filter(line => line.length > 0).join("\n");
    }

    private isDue(job: IAgentJob, now: Date): boolean {
        if (job.active === false) {
            return false;
        }

        const nextRunAt = this.resolveDate(job.runtime?.nextRunAt) ?? this.resolveInitialRunAt(job, now);
        return Boolean(nextRunAt && nextRunAt.getTime() <= now.getTime());
    }

    private resolveDueDate(job: IAgentJob, fallback: Date): Date {
        return this.resolveDate(job.runtime?.nextRunAt) ?? this.resolveInitialRunAt(job, fallback) ?? fallback;
    }

    private resolveInitialRunAt(job: IAgentJob, now: Date): Date | null {
        if (job.schedule.type === "once") {
            return this.resolveDate(job.schedule.runAt);
        }

        if (job.schedule.type === "interval") {
            const lastRunAt = this.resolveDate(job.runtime?.lastRunAt);
            const createdAt = this.resolveDate(job.createdAt);

            if (lastRunAt) {
                return this.calculateNextRunAt(job, lastRunAt) ?? null;
            }

            if (createdAt) {
                return this.calculateNextRunAt(job, createdAt) ?? null;
            }

            return now;
        }

        return null;
    }

    private calculateNextRunAt(job: IAgentJob, from: Date): Date | undefined {
        switch (job.schedule.type) {
            case "interval":
                return this.addInterval(from, job.schedule.interval?.every, job.schedule.interval?.unit);
            case "daily":
                return this.nextDailyRun(from, job.schedule.time);
            case "weekly":
                return this.nextWeeklyRun(from, job.schedule.time, job.schedule.daysOfWeek ?? []);
            case "monthly":
                return this.nextMonthlyRun(from, job.schedule.time, job.schedule.daysOfMonth ?? []);
            case "once":
            case "cron":
            default:
                return undefined;
        }
    }

    private addInterval(from: Date, every: number | undefined, unit: string | undefined): Date | undefined {
        if (!every || !unit) {
            return undefined;
        }

        const next = new Date(from);
        const multiplier = unit === "minutes" ? 60_000 : unit === "hours" ? 3_600_000 : 86_400_000;
        next.setTime(next.getTime() + every * multiplier);

        return next;
    }

    private nextDailyRun(from: Date, time?: string): Date | undefined {
        const next = this.dateAtTime(from, time);

        if (next.getTime() <= from.getTime()) {
            next.setDate(next.getDate() + 1);
        }

        return next;
    }

    private nextWeeklyRun(from: Date, time: string | undefined, daysOfWeek: string[]): Date | undefined {
        if (daysOfWeek.length === 0) {
            return undefined;
        }

        const allowedDays = new Set(daysOfWeek.map(day => this.weekdayNumber(day)));

        for (let offset = 0; offset <= 7; offset++) {
            const candidate = this.dateAtTime(from, time);
            candidate.setDate(candidate.getDate() + offset);

            if (allowedDays.has(candidate.getDay()) && candidate.getTime() > from.getTime()) {
                return candidate;
            }
        }

        return undefined;
    }

    private nextMonthlyRun(from: Date, time: string | undefined, daysOfMonth: number[]): Date | undefined {
        if (daysOfMonth.length === 0) {
            return undefined;
        }

        const sortedDays = [...daysOfMonth].sort((a, b) => a - b);

        for (let monthOffset = 0; monthOffset <= 1; monthOffset++) {
            for (const day of sortedDays) {
                const candidate = this.dateAtTime(from, time);
                const targetMonth = candidate.getMonth() + monthOffset;
                candidate.setMonth(targetMonth, day);

                if (candidate.getMonth() === this.normalizeMonth(targetMonth) && candidate.getTime() > from.getTime()) {
                    return candidate;
                }
            }
        }

        return undefined;
    }

    private dateAtTime(date: Date, time?: string): Date {
        const [hours, minutes] = (time ?? "00:00").split(":").map(value => Number(value));
        const result = new Date(date);
        result.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);

        return result;
    }

    private normalizeMonth(month: number): number {
        return ((month % 12) + 12) % 12;
    }

    private weekdayNumber(day: string): number {
        return {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6
        }[day] ?? -1;
    }

    private async withTimeout<T>(promise: Promise<T>, timeoutSeconds: number): Promise<T> {
        let timeout: NodeJS.Timeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timeout = setTimeout(() => reject(new AgentJobTimeoutError(timeoutSeconds)), timeoutSeconds * 1000);
        });

        try {
            return await Promise.race([promise, timeoutPromise]);
        } finally {
            clearTimeout(timeout);
        }
    }

    private resolveDate(value: any): Date | null {
        if (!value) {
            return null;
        }

        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    private stringifyId(record: any): string {
        return this.stringifyRelationId(record?._id ?? record?.id ?? record);
    }

    private stringifyRelationId(value: any): string {
        if (value === null || value === undefined) {
            return "";
        }

        if (typeof value === "string") {
            return value;
        }

        if (typeof value === "object") {
            return this.stringifyRelationId(value._id ?? value.id);
        }

        return String(value);
    }

    private normalizeRecord(value: any): Record<string, any> | undefined {
        if (!value) {
            return undefined;
        }

        if (typeof value === "object" && !Array.isArray(value)) {
            return value;
        }

        return {value};
    }

    private normalizeToolCall(toolCall: {
        name: string;
        status: "success" | "failed";
        input?: any;
        output?: any;
        errorMessage?: string;
        durationMs?: number;
    }): AgentJobToolCall {
        return {
            name: toolCall.name,
            status: toolCall.status,
            input: this.normalizeRecord(toolCall.input),
            output: this.normalizeRecord(toolCall.output),
            errorMessage: toolCall.errorMessage,
            durationMs: toolCall.durationMs
        };
    }

    private resolveErrorCode(error: any): string {
        return error?.name ?? "AgentJobExecutionError";
    }

    private resolveErrorMessage(error: any): string {
        return error?.message ?? String(error);
    }
}

export type {AgentJobRunOptions, AgentJobRunDueOptions, AgentJobRunDueResult};
export default AgentJobRunnerService;
export {AgentJobRunnerService, AgentJobTimeoutError};
