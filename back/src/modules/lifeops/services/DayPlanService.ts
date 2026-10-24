
import type{IDayPlanRepository} from "../interfaces/IDayPlanRepository";
import type {IDayPlanBase, IDayPlan} from "../interfaces/IDayPlan";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import {BadRequestError, NotFoundError, ValidationError, ZodErrorToValidationError} from '@drax/common-back';
import {DayPlanPatchSchema, DayPlanPlanningSchema, DayPlanScheduleTaskSchema, DayPlanAvailableSlotsSchema} from '../schemas/DayPlanSchema.js';
import TaskServiceFactory from '../factory/services/TaskServiceFactory.js';
import TaskStatusServiceFactory from '../factory/services/TaskStatusServiceFactory.js';
import GoogleCalendarServiceFactory from '../../google/factory/GoogleCalendarServiceFactory.js';
import DayPlanJobFactory from '../factory/services/DayPlanJobFactory.js';
import {DayPlanProposalsSchema} from '../schemas/DayPlanSchema.js';
import {createHash} from 'node:crypto';

class DayPlanService extends AbstractService<IDayPlan, IDayPlanBase, IDayPlanBase> {


    constructor(DayPlanRepository: IDayPlanRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(DayPlanRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        this.transformRead = this.normalizeRead.bind(this)
        
    }

    async validateInputUpdatePartial(data: any): Promise<any> {
        const parsed = DayPlanPatchSchema.safeParse(data);
        if (!parsed.success) throw ZodErrorToValidationError(parsed.error, data);
        return parsed.data;
    }

    async validateInputUpdate(data: IDayPlanBase): Promise<IDayPlanBase> {
        return this.validateInputUpdatePartial(data);
    }

    async create(data: IDayPlanBase): Promise<IDayPlan> {
        const parsed = await this.validateInputCreate(data);
        await this.validatePlan(parsed);
        await this.startSelectedTasks(parsed.tasks);
        return super.create({...parsed, status: this.derivedStatus(parsed)});
    }

    async update(id: string, data: IDayPlanBase): Promise<IDayPlan> {
        return this.withPlanLock(id, async () => {
            const parsed = await this.validateInputUpdate(data);
            const plan = await this.validateChange(id, parsed);
            await this.startSelectedTasks(parsed.tasks);
            return super.update(id, {...parsed, status: this.derivedStatus(plan)});
        });
    }

    async updatePartial(id: string, data: any): Promise<IDayPlan> {
        return this.withPlanLock(id, () => this.persistPartial(id, data));
    }

    private async persistPartial(id: string, data: any): Promise<IDayPlan> {
        const parsed = await this.validateInputUpdatePartial(data);
        const plan = await this.validateChange(id, parsed);
        await this.startSelectedTasks(parsed.tasks);
        return super.updatePartial(id, {...parsed, status: this.derivedStatus(plan)});
    }

    private async startSelectedTasks(tasks: IDayPlanBase['tasks']): Promise<void> {
        const selected = (tasks ?? []).filter(item => item.decision !== 'DESCARTADO' &&
            (item.priority || item.decision === 'DESEABLE' || item.decision === 'COMPROMETIDO'));
        if (!selected.length) return;

        const statuses = await TaskStatusServiceFactory.instance.fetchAll();
        const workingStatus = statuses.find(status => status.startsTask && !status.completesTask && !status.archivesTask);
        if (!workingStatus) return;

        const taskService = TaskServiceFactory.instance;
        for (const entry of selected) {
            const task = await taskService.findById(this.id(entry.task));
            const status = statuses.find(status => status.name === task?.status);
            if (!task || task.completedAt || task.archivedAt || status?.completesTask || status?.archivesTask || status?.startsTask) continue;
            await taskService.updatePartial(this.id(entry.task), {status: workingStatus.name});
        }
    }

    private derivedStatus(plan: IDayPlanBase): string {
        return (plan.tasks ?? []).filter(item => item.priority && item.decision !== 'DESCARTADO').length === 3
            ? 'CONFIRMADO' : 'BORRADOR';
    }

    private mutations = new Map<string, Promise<unknown>>();

    private async withPlanLock<T>(id: string, action: () => Promise<T>): Promise<T> {
        const pending = (this.mutations.get(id) ?? Promise.resolve()).catch(() => {}).then(action);
        this.mutations.set(id, pending);
        try { return await pending; }
        finally { if (this.mutations.get(id) === pending) this.mutations.delete(id); }
    }

    async proposals(userId: string, id: string, input: {mode: 'more' | 'other'}, tenant?: string | null): Promise<IDayPlan> {
        const {mode} = DayPlanProposalsSchema.parse(input);
        const original = await this.findById(id);
        if (!original || this.id(original.user) !== userId || (tenant && this.id(original.tenant) !== tenant)) throw new NotFoundError();
        const job = DayPlanJobFactory.instance;
        const excluded = (original.tasks ?? []).map(item => this.id(item.task));
        const selected = await job.selectTaskProposals(userId, {
            date: original.date, events: original.events, tasks: original.tasks, tenant: this.tenantId(original.tenant),
        }, excluded);
        return this.withPlanLock(id, async () => {
            // Merge only after the slow AI call, using the latest user decisions.
            const latest = await this.findById(id);
            if (!latest || this.id(latest.user) !== userId || (tenant && this.id(latest.tenant) !== tenant)) throw new NotFoundError();
            const current = latest.tasks ?? [];
            const additions: NonNullable<IDayPlanBase['tasks']> = [];
            for (const candidate of selected) {
                const taskId = this.id(candidate);
                if (current.some(item => this.id(item.task) === taskId)) continue;
                const task = await TaskServiceFactory.instance.findById(taskId);
                if (task && this.id(task.user) === userId && this.tenantId(task.tenant) === this.tenantId(original.tenant) && job.isPendingTask(task)) {
                    additions.push({task: taskId, decision: 'PENDIENTE'});
                }
            }
            if (!additions.length) return latest;
            const retained = current.filter(item => mode === 'more' || !excluded.includes(this.id(item.task)) ||
                item.priority || (item.decision && item.decision !== 'PENDIENTE'));
            return this.persistPartial(id, {tasks: [
                ...retained.map(item => ({...item, task: this.id(item.task)})), ...additions,
            ]});
        });
    }

    private async validateChange(id: string, data: Partial<IDayPlanBase>) {
        const previous = await this.findById(id);
        if (!previous) throw new NotFoundError();
        const plan = {...previous, ...data};
        await this.validatePlan(plan);
        return plan;
    }

    private async validatePlan(plan: IDayPlanBase) {
        const tasks = plan.tasks ?? [];
        const ids = tasks.map(item => this.id(item.task));
        const priorities = tasks.flatMap(item => item.priority ? [item.priority] : []);
        if (new Set(ids).size !== ids.length || new Set(priorities).size !== priorities.length) {
            throw new ValidationError([{field: 'tasks', reason: 'dayPlan.tasks.duplicate'}]);
        }
        if (tasks.some(item => item.priority && item.decision === 'DESCARTADO')) {
            throw new ValidationError([{field: 'tasks', reason: 'dayPlan.priority.threeRequired'}]);
        }
        for (const taskId of ids) {
            const task = await TaskServiceFactory.instance.findById(taskId);
            if (!task || this.id(task.user) !== this.id(plan.user) || this.tenantId(task.tenant) !== this.tenantId(plan.tenant)) {
                throw new ValidationError([{field: 'tasks', reason: 'dayPlan.task.invalidOwner'}]);
            }
        }
    }

    async planning(userId: string, date: string, tenant?: string | null): Promise<IDayPlan | null> {
        DayPlanPlanningSchema.parse({date});
        const start = new Date(`${date}T00:00:00.000Z`);
        const plans = await this.find({limit: 1, filters: [
            {field: 'user', operator: 'eq', value: userId},
            ...(tenant ? [{field: 'tenant', operator: 'eq', value: tenant}] : []),
            {field: 'date', operator: 'gte', value: start},
            {field: 'date', operator: 'lt', value: new Date(start.getTime() + 86400000)},
        ]});
        return plans[0] ?? null;
    }

    async availableSlots(userId: string, date: string, utcOffsetMinutes = 0) {
        DayPlanAvailableSlotsSchema.parse({date, utcOffsetMinutes});
        const start = Date.parse(`${date}T00:00:00.000Z`) + utcOffsetMinutes * 60000;
        const end = start + 86400000;
        const busy = await GoogleCalendarServiceFactory.instance.primaryBusy(userId,
            new Date(start).toISOString(), new Date(end).toISOString());
        const now = Date.now();
        const slots: Array<{startAt: string; endAt: string}> = [];
        for (let time = start; time < end; time += 3600000) {
            const finish = time + 3600000;
            if (time <= now || busy.some(interval => Date.parse(interval.start) < finish && Date.parse(interval.end) > time)) continue;
            slots.push({startAt: new Date(time).toISOString(), endAt: new Date(finish).toISOString()});
        }
        return {slots};
    }

    private scheduling = new Map<string, Promise<unknown>>();

    async scheduleTask(userId: string, planId: string, input: {taskId: string; startAt: string; utcOffsetMinutes?: number}, tenant?: string | null) {
        // Serialize fresh availability checks for this user's requests in this process.
        const previous = this.scheduling.get(userId) ?? Promise.resolve();
        const pending = previous.catch(() => {}).then(() => this.scheduleTaskUnlocked(userId, planId, input, tenant));
        this.scheduling.set(userId, pending);
        try { return await pending; }
        finally { if (this.scheduling.get(userId) === pending) this.scheduling.delete(userId); }
    }

    private async scheduleTaskUnlocked(userId: string, planId: string, input: {taskId: string; startAt: string; utcOffsetMinutes?: number}, tenant?: string | null) {
        const {taskId, startAt, utcOffsetMinutes} = DayPlanScheduleTaskSchema.parse(input);
        const plan = await this.findById(planId);
        if (!plan || this.id(plan.user) !== userId || (tenant && this.id(plan.tenant) !== tenant)) throw new NotFoundError();
        if (!plan.tasks?.some(item => this.id(item.task) === taskId)) throw new BadRequestError('dayPlan.task.notInPlan');
        const taskService = TaskServiceFactory.instance;
        const task = await taskService.findById(taskId);
        if (!task || this.id(task.user) !== userId || this.tenantId(task.tenant) !== this.tenantId(plan.tenant)) throw new NotFoundError();
        const start = new Date(startAt);
        // Browser offset is UTC minus local time; plan.date is independent of the booking day.
        const localStart = new Date(start.getTime() - utcOffsetMinutes * 60000);
        const date = localStart.toISOString().slice(0, 10);
        if (localStart.getUTCMinutes() || localStart.getUTCSeconds() || localStart.getUTCMilliseconds()) {
            throw new BadRequestError('dayPlan.slot.invalid');
        }
        if (task.calendarEventId) {
            if (task.scheduledDate && new Date(task.scheduledDate).getTime() === start.getTime()) return this.findById(planId);
            throw new BadRequestError('dayPlan.task.alreadyScheduled');
        }
        const calendar = GoogleCalendarServiceFactory.instance;
        // Google IDs are deterministic per task, including retries after a database failure.
        const eventId = createHash('sha256').update(`dayplan:${userId}:${taskId}`).digest('hex');
        let event = await calendar.getPrimaryEvent(userId, eventId);
        if (!event) {
            const {slots} = await this.availableSlots(userId, date, utcOffsetMinutes);
            const slot = slots.find(item => item.startAt === start.toISOString());
            if (!slot) throw new BadRequestError('dayPlan.slot.unavailable');
            try {
                event = await calendar.createEvent({userId, event: {
                    id: eventId, calendarId: 'primary', summary: task.title,
                    description: task.description,
                    start: {dateTime: slot.startAt}, end: {dateTime: slot.endAt},
                }});
            } catch (error) {
                if ((error as any).status !== 409) throw error;
                event = await calendar.getPrimaryEvent(userId, eventId);
            }
        }
        if (!event || event.status === 'cancelled' ||
            Date.parse(event.start.dateTime ?? '') !== start.getTime() ||
            Date.parse(event.end.dateTime ?? '') !== start.getTime() + 3600000) {
            throw new BadRequestError('dayPlan.task.alreadyScheduled');
        }
        await taskService.updatePartial(taskId, {calendarEventId: event.id, scheduledDate: start});
        return this.findById(planId);
    }

    private tenantId(value: any): string | null { return value ? this.id(value) : null; }

    private id(value: any): string { return String(value?._id ?? value); }

    private async normalizeRead(dayPlan: IDayPlan): Promise<IDayPlan> {
        const normalized = typeof (dayPlan as any).toObject === 'function'
            ? (dayPlan as any).toObject({virtuals: true})
            : {...dayPlan}

        if (Array.isArray(normalized.tasks)) {
            normalized.tasks = normalized.tasks.filter(({task}) => task != null)
        }

        if (Array.isArray(normalized.habits)) {
            normalized.habits = normalized.habits.filter(({habit}) => habit != null)
        }

        return normalized
    }

}

export default DayPlanService
export {DayPlanService}
