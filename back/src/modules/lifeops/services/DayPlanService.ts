
import type{IDayPlanRepository} from "../interfaces/IDayPlanRepository";
import type {IDayPlanBase, IDayPlan} from "../interfaces/IDayPlan";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import {BadRequestError, NotFoundError, ValidationError, ZodErrorToValidationError} from '@drax/common-back';
import {DayPlanPatchSchema, DayPlanPlanningSchema, DayPlanScheduleTaskSchema, DayPlanAvailableSlotsSchema} from '../schemas/DayPlanSchema.js';
import TaskServiceFactory from '../factory/services/TaskServiceFactory.js';
import GoogleCalendarServiceFactory from '../../google/factory/GoogleCalendarServiceFactory.js';
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
        return super.create(parsed);
    }

    async update(id: string, data: IDayPlanBase): Promise<IDayPlan> {
        const parsed = await this.validateInputUpdate(data);
        await this.validateChange(id, parsed);
        return super.update(id, parsed);
    }

    async updatePartial(id: string, data: any): Promise<IDayPlan> {
        const parsed = await this.validateInputUpdatePartial(data);
        await this.validateChange(id, parsed);
        return super.updatePartial(id, parsed);
    }

    private async validateChange(id: string, data: Partial<IDayPlanBase>) {
        const previous = await this.findById(id);
        if (!previous) throw new NotFoundError();
        await this.validatePlan({...previous, ...data});
    }

    private async validatePlan(plan: IDayPlanBase) {
        const tasks = plan.tasks ?? [];
        const ids = tasks.map(item => this.id(item.task));
        const priorities = tasks.flatMap(item => item.priority ? [item.priority] : []);
        if (new Set(ids).size !== ids.length || new Set(priorities).size !== priorities.length) {
            throw new ValidationError([{field: 'tasks', reason: 'dayPlan.tasks.duplicate'}]);
        }
        if (['CONFIRMADO', 'CERRADO'].includes(plan.status) &&
            (!['A1', 'A2', 'A3'].every(rank => priorities.includes(rank as any)) ||
                tasks.some(item => item.priority && item.decision === 'DESCARTADO'))) {
            throw new ValidationError([{field: 'tasks', reason: 'dayPlan.priority.threeRequired'}]);
        }
        for (const taskId of ids) {
            const task = await TaskServiceFactory.instance.findById(taskId);
            if (!task || this.id(task.user) !== this.id(plan.user)) {
                throw new ValidationError([{field: 'tasks', reason: 'dayPlan.task.invalidOwner'}]);
            }
        }
    }

    async planning(userId: string, date: string): Promise<IDayPlan | null> {
        DayPlanPlanningSchema.parse({date});
        const start = new Date(`${date}T00:00:00.000Z`);
        const plans = await this.find({limit: 1, filters: [
            {field: 'user', operator: 'eq', value: userId},
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

    async scheduleTask(userId: string, planId: string, input: {taskId: string; startAt: string; utcOffsetMinutes?: number}) {
        // Serialize fresh availability checks for this user's requests in this process.
        const previous = this.scheduling.get(userId) ?? Promise.resolve();
        const pending = previous.catch(() => {}).then(() => this.scheduleTaskUnlocked(userId, planId, input));
        this.scheduling.set(userId, pending);
        try { return await pending; }
        finally { if (this.scheduling.get(userId) === pending) this.scheduling.delete(userId); }
    }

    private async scheduleTaskUnlocked(userId: string, planId: string, input: {taskId: string; startAt: string; utcOffsetMinutes?: number}) {
        const {taskId, startAt, utcOffsetMinutes} = DayPlanScheduleTaskSchema.parse(input);
        const plan = await this.findById(planId);
        if (!plan || this.id(plan.user) !== userId) throw new NotFoundError();
        if (!plan.tasks?.some(item => this.id(item.task) === taskId)) throw new BadRequestError('dayPlan.task.notInPlan');
        const taskService = TaskServiceFactory.instance;
        const task = await taskService.findById(taskId);
        if (!task || this.id(task.user) !== userId) throw new NotFoundError();
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
