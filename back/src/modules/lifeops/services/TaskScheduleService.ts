import type{ITaskScheduleRepository} from "../interfaces/ITaskScheduleRepository";
import type {ITaskScheduleBase, ITaskSchedule} from "../interfaces/ITaskSchedule";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import TaskServiceFactory from "../factory/services/TaskServiceFactory.js";
import {TaskScheduleCalculator} from "./TaskScheduleCalculator.js";
import type {ITask, ITaskBase} from "../interfaces/ITask.js";

interface TaskScheduleExecutionResult {
    schedule: ITaskSchedule
    task: ITask | null
    scheduledFor: Date
    status: "success" | "failed"
    duplicate: boolean
    error?: string
}

class TaskScheduleService extends AbstractService<ITaskSchedule, ITaskScheduleBase, ITaskScheduleBase> {
    private readonly calculator = new TaskScheduleCalculator()

    constructor(TaskScheduleRepository: ITaskScheduleRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TaskScheduleRepository, baseSchema, fullSchema);

        this._validateOutput = true
        this.transformCreate = this.prepareCreate.bind(this)
    }

    async findDue(now: Date, limit: number): Promise<ITaskSchedule[]> {
        if (!this.repository.findDue) {
            throw new Error("taskSchedule.due.repositoryUnsupported")
        }

        return this.repository.findDue(now, limit)
    }

    async initializeMissingNextRunAt(now: Date, limit: number): Promise<number> {
        if (!this.repository.findActiveWithoutNextRunAt) {
            return 0
        }

        const schedules = await this.repository.findActiveWithoutNextRunAt(now, limit)
        let initialized = 0

        for (const schedule of schedules) {
            const normalizedSchedule = this.normalizeLegacyEpochDates(schedule)
            const nextRunAt = this.calculateBoundedNextRunAt(normalizedSchedule, now)
            if (!nextRunAt) {
                continue
            }

            await super.updatePartial(this.stringifyId(schedule), {
                schedule: {
                    ...normalizedSchedule.schedule,
                    runAt: normalizedSchedule.schedule.runAt ?? null
                },
                runtime: {
                    ...(normalizedSchedule.runtime ?? {}),
                    lastRunAt: normalizedSchedule.runtime?.lastRunAt ?? null,
                    nextRunAt
                },
                startAt: normalizedSchedule.startAt ?? null,
                endAt: normalizedSchedule.endAt ?? null
            })
            initialized += 1
        }

        return initialized
    }

    async update(id: string, data: ITaskScheduleBase): Promise<ITaskSchedule> {
        const prepared = await this.prepareUpdate(id, data)
        return super.update(id, prepared)
    }

    async updatePartial(id: string, data: any): Promise<ITaskSchedule> {
        const prepared = await this.prepareUpdate(id, data)
        return super.updatePartial(id, prepared)
    }

    async activate(id: string): Promise<ITaskSchedule> {
        const schedule = await this.findById(id)
        if (!schedule) {
            throw new Error("taskSchedule.notFound")
        }

        return this.updatePartial(id, {
            active: true,
            runtime: {
                ...(schedule.runtime ?? {}),
                nextRunAt: this.calculateBoundedNextRunAt(schedule, new Date())
            }
        })
    }

    async deactivate(id: string): Promise<ITaskSchedule> {
        const schedule = await this.findById(id)
        if (!schedule) {
            throw new Error("taskSchedule.notFound")
        }

        return this.updatePartial(id, {
            active: false,
            runtime: schedule.runtime ?? {}
        })
    }

    async executeDueSchedule(schedule: ITaskSchedule, now: Date = new Date()): Promise<TaskScheduleExecutionResult> {
        const scheduledFor = this.resolveDate(schedule.runtime?.nextRunAt)

        if (!scheduledFor || scheduledFor.getTime() > now.getTime()) {
            return {
                schedule,
                task: null,
                scheduledFor: scheduledFor ?? now,
                status: "failed",
                duplicate: false,
                error: "taskSchedule.notDue"
            }
        }

        console.log("[task-schedule] execution started", {
            taskScheduleId: this.stringifyId(schedule),
            scheduledFor: scheduledFor.toISOString()
        })

        try {
            const {task, duplicate} = await this.createTaskForOccurrence(schedule, scheduledFor)
            const nextRunAt = this.calculateBoundedNextRunAt(schedule, scheduledFor)
            const updatedSchedule = await this.updateRuntime(schedule, {
                lastRunAt: now,
                nextRunAt,
                lastTaskId: task?._id,
                lastStatus: "success",
                lastError: undefined
            })

            console.log("[task-schedule] runtime updated", {
                taskScheduleId: this.stringifyId(schedule),
                scheduledFor: scheduledFor.toISOString(),
                taskId: task?._id ?? null,
                nextRunAt: nextRunAt?.toISOString() ?? null
            })

            return {
                schedule: updatedSchedule,
                task,
                scheduledFor,
                status: "success",
                duplicate
            }
        } catch (error) {
            const message = this.resolveErrorMessage(error)
            const nextRunAt = this.calculateBoundedNextRunAt(schedule, scheduledFor)
            const updatedSchedule = await this.updateRuntime(schedule, {
                lastRunAt: now,
                nextRunAt,
                lastStatus: "failed",
                lastError: message
            })

            console.error("[task-schedule] execution failed", {
                taskScheduleId: this.stringifyId(schedule),
                scheduledFor: scheduledFor.toISOString(),
                message
            })

            return {
                schedule: updatedSchedule,
                task: null,
                scheduledFor,
                status: "failed",
                duplicate: false,
                error: message
            }
        }
    }

    private async createTaskForOccurrence(schedule: ITaskSchedule, scheduledFor: Date): Promise<{task: ITask; duplicate: boolean}> {
        const existingTask = await TaskServiceFactory.instance.findByScheduleOccurrence(this.stringifyId(schedule), scheduledFor)
        if (existingTask) {
            console.log("[task-schedule] occurrence already created", {
                taskScheduleId: this.stringifyId(schedule),
                scheduledFor: scheduledFor.toISOString(),
                taskId: existingTask._id
            })

            return {task: existingTask, duplicate: true}
        }

        const payload = this.buildTaskPayload(schedule, scheduledFor)

        try {
            const task = await TaskServiceFactory.instance.create(payload)
            console.log("[task-schedule] task created", {
                taskScheduleId: this.stringifyId(schedule),
                scheduledFor: scheduledFor.toISOString(),
                taskId: task._id
            })
            return {task, duplicate: false}
        } catch (error) {
            if (!this.isDuplicateKeyError(error) && error?.name !== "ValidationError") {
                throw error
            }

            const duplicatedTask = await TaskServiceFactory.instance.findByScheduleOccurrence(this.stringifyId(schedule), scheduledFor)
            if (!duplicatedTask) {
                throw error
            }

            console.log("[task-schedule] occurrence already created", {
                taskScheduleId: this.stringifyId(schedule),
                scheduledFor: scheduledFor.toISOString(),
                taskId: duplicatedTask._id
            })

            return {task: duplicatedTask, duplicate: true}
        }
    }

    private buildTaskPayload(schedule: ITaskSchedule, scheduledFor: Date): ITaskBase {
        const task = schedule.task
        const dueDate = this.calculator.calculateDueDate(schedule.dueDateRule, scheduledFor, schedule.schedule.timezone)
        const payload: ITaskBase = {
            title: task.title,
            description: task.description,
            source: this.stringifyOptionalId(task.source),
            type: this.stringifyOptionalId(task.type),
            lifeArea: this.stringifyOptionalId(task.lifeArea),
            status: this.stringifyOptionalId(task.status),
            priority: task.priority,
            goals: Array.isArray(task.goals) ? task.goals.map(goal => this.stringifyOptionalId(goal)).filter(Boolean) : [],
            project: this.stringifyOptionalId(task.project),
            valueScore: task.valueScore,
            motivationScore: task.motivationScore,
            effortScore: task.effortScore,
            urgent: task.urgent,
            tags: [...(task.tags ?? [])],
            dueDate,
            user: this.stringifyId(schedule.user),
            taskSchedule: this.stringifyId(schedule),
            scheduledFor
        }

        return this.removeUndefined(payload) as ITaskBase
    }

    private async prepareCreate(data: ITaskScheduleBase): Promise<ITaskScheduleBase> {
        const active = data.active !== false
        const from = this.resolveDate(data.startAt) ?? new Date()
        const prepared: ITaskScheduleBase = {
            ...data,
            active,
            dueDateRule: data.dueDateRule ?? {type: "none"},
            runtime: {
                ...(data.runtime ?? {}),
                nextRunAt: active ? this.calculateBoundedNextRunAt(data, from) : data.runtime?.nextRunAt
            }
        }

        this.assertValidSchedule(prepared)
        return prepared
    }

    private async prepareUpdate(id: string, data: Partial<ITaskScheduleBase>): Promise<ITaskScheduleBase> {
        if (data.runtime) {
            data.runtime = this.normalizeRuntime(data.runtime)
        }

        const previous = await this.repository.findById(id)
        if (!previous) {
            throw new Error("taskSchedule.notFound")
        }

        const merged = this.normalizeLegacyEpochDates(this.mergeSchedule(previous, data))
        const shouldRecalculate = this.shouldRecalculateNextRunAt(data) || !this.resolveDate(merged.runtime?.nextRunAt)
        this.assertValidSchedule(merged)

        if (!this.resolveDate(merged.startAt)) {
            data.startAt = null as any
        }
        if (!this.resolveDate(merged.endAt)) {
            data.endAt = null as any
        }

        if (merged.active !== false && shouldRecalculate) {
            data.runtime = this.normalizeRuntime({
                ...(previous.runtime ?? {}),
                ...(data.runtime ?? {}),
                nextRunAt: this.calculateBoundedNextRunAt(merged, new Date())
            })
        }

        return data as ITaskScheduleBase
    }

    private shouldRecalculateNextRunAt(data: any): boolean {
        return ["schedule", "startAt", "endAt", "active"].some(field => Object.prototype.hasOwnProperty.call(data, field))
    }

    private mergeSchedule(previous: ITaskSchedule, data: any): ITaskScheduleBase {
        return {
            ...previous,
            ...data,
            task: {
                ...previous.task,
                ...(data.task ?? {})
            },
            schedule: {
                ...previous.schedule,
                ...(data.schedule ?? {})
            },
            dueDateRule: {
                ...(previous.dueDateRule ?? {}),
                ...(data.dueDateRule ?? {})
            },
            runtime: {
                ...(previous.runtime ?? {}),
                ...(data.runtime ?? {})
            },
            user: this.stringifyId(data.user ?? previous.user)
        }
    }

    private assertValidSchedule(data: ITaskScheduleBase): void {
        const schedule = data.schedule

        if (!this.calculator.isValidTimezone(schedule.timezone)) {
            throw new Error("taskSchedule.timezone.invalid")
        }

        if (!this.calculator.isValidTime(schedule.time)) {
            throw new Error("taskSchedule.time.invalid")
        }

        if (data.startAt && data.endAt && new Date(data.startAt).getTime() > new Date(data.endAt).getTime()) {
            throw new Error("taskSchedule.endAt.afterStartAt")
        }

        if (schedule.type === "once" && !schedule.runAt) {
            throw new Error("taskSchedule.schedule.runAt.required")
        }

        if (schedule.type === "interval" && (!schedule.interval?.every || !schedule.interval?.unit)) {
            throw new Error("taskSchedule.schedule.interval.required")
        }

        if (schedule.type === "weekly" && !schedule.daysOfWeek?.length) {
            throw new Error("taskSchedule.schedule.daysOfWeek.required")
        }

        if (schedule.type === "monthly" && schedule.monthlyMode !== "lastDayOfMonth" && !schedule.daysOfMonth?.length) {
            throw new Error("taskSchedule.schedule.daysOfMonth.required")
        }

        if (schedule.type === "yearly" && (!schedule.monthsOfYear?.length || !schedule.daysOfMonth?.length)) {
            throw new Error("taskSchedule.schedule.yearly.required")
        }

        if (data.dueDateRule?.type === "daysAfter" && data.dueDateRule.daysAfter === undefined) {
            throw new Error("taskSchedule.dueDateRule.daysAfter.required")
        }
    }

    private async updateRuntime(schedule: ITaskSchedule, runtime: NonNullable<ITaskSchedule["runtime"]>): Promise<ITaskSchedule> {
        return this.updatePartial(this.stringifyId(schedule), {
            runtime: {
                ...(schedule.runtime ?? {}),
                ...runtime
            }
        })
    }

    private calculateBoundedNextRunAt(schedule: Pick<ITaskScheduleBase, "schedule" | "startAt" | "endAt">, from: Date): Date | undefined {
        const startAt = this.resolveDate(schedule.startAt)
        const endAt = this.resolveDate(schedule.endAt)
        const effectiveFrom = startAt && startAt.getTime() > from.getTime() ? new Date(startAt.getTime() - 1) : from
        const nextRunAt = this.calculator.calculateNextRunAt(schedule.schedule, effectiveFrom)

        if (!nextRunAt) {
            return undefined
        }

        if (startAt && nextRunAt.getTime() < startAt.getTime()) {
            return this.calculator.calculateNextRunAt(schedule.schedule, new Date(startAt.getTime() - 1))
        }

        if (endAt && nextRunAt.getTime() > endAt.getTime()) {
            return undefined
        }

        return nextRunAt
    }

    private get repository(): ITaskScheduleRepository {
        return this._repository as ITaskScheduleRepository
    }

    private removeUndefined<T extends Record<string, any>>(value: T): T {
        return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T
    }

    private stringifyId(record: any): string {
        return this.stringifyOptionalId(record) ?? ""
    }

    private stringifyOptionalId(record: any): string | undefined {
        if (record === null || record === undefined || record === "") {
            return undefined
        }

        if (typeof record === "string") {
            return record
        }

        if (typeof record === "object") {
            if (typeof record.toHexString === "function") {
                return record.toHexString()
            }

            if (record._id === record || record.id === record) {
                return record.toString()
            }

            return this.stringifyOptionalId(record._id ?? record.id)
        }

        return String(record)
    }

    private normalizeRuntime(runtime: NonNullable<ITaskScheduleBase["runtime"]>): NonNullable<ITaskScheduleBase["runtime"]> {
        return {
            ...runtime,
            lastTaskId: runtime.lastTaskId === null ? null : this.stringifyOptionalId(runtime.lastTaskId)
        }
    }

    private normalizeLegacyEpochDates<T extends Pick<ITaskScheduleBase, "schedule" | "runtime" | "startAt" | "endAt">>(schedule: T): T {
        return {
            ...schedule,
            schedule: {
                ...schedule.schedule,
                runAt: this.resolveDate(schedule.schedule.runAt)
            },
            runtime: schedule.runtime ? {
                ...schedule.runtime,
                lastRunAt: this.resolveDate(schedule.runtime.lastRunAt),
                nextRunAt: this.resolveDate(schedule.runtime.nextRunAt)
            } : undefined,
            startAt: this.resolveDate(schedule.startAt),
            endAt: this.resolveDate(schedule.endAt)
        }
    }

    private resolveDate(value: any): Date | undefined {
        if (!value) {
            return undefined
        }

        const date = value instanceof Date ? value : new Date(value)
        return Number.isNaN(date.getTime()) || date.getTime() === 0 ? undefined : date
    }

    private isDuplicateKeyError(error: any): boolean {
        if (error?.code === 11000 || error?.name === "MongoServerError" && error?.message?.includes("E11000")) {
            return true
        }

        if (error?.name === "ValidationError") {
            return Object.values(error.errors ?? {}).some((entry: any) =>
                entry?.kind === "unique" || entry?.message === "validation.unique" || entry?.message?.includes("validation.unique")
            )
        }

        return false
    }

    private resolveErrorMessage(error: any): string {
        return error?.message ?? String(error)
    }
}

export default TaskScheduleService
export {TaskScheduleService}
export type {TaskScheduleExecutionResult}
