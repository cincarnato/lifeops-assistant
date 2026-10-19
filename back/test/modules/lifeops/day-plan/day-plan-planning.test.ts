import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import Fastify from 'fastify';
import DayPlanService from '../../../../src/modules/lifeops/services/DayPlanService.js';
import DayPlanJob from '../../../../src/modules/lifeops/jobs/DayPlanJob.js';
import DayPlanServiceFactory from '../../../../src/modules/lifeops/factory/services/DayPlanServiceFactory.js';
import TaskServiceFactory from '../../../../src/modules/lifeops/factory/services/TaskServiceFactory.js';
import GoogleCalendarServiceFactory from '../../../../src/modules/google/factory/GoogleCalendarServiceFactory.js';
import GoogleCalendarService from '../../../../src/modules/google/services/GoogleCalendarService.js';
import DayPlanRoutes from '../../../../src/modules/lifeops/routes/DayPlanRoutes.js';
import {DayPlanBaseSchema, DayPlanPatchSchema, DayPlanSchema, DayPlanTasksSchema, DayPlanAvailableSlotsSchema, DayPlanScheduleTaskSchema} from '../../../../src/modules/lifeops/schemas/DayPlanSchema.js';

const user = '111111111111111111111111';
const ids = ['222222222222222222222222', '333333333333333333333333', '444444444444444444444444'];
const planId = '555555555555555555555555';
const date = '2030-01-02';
const startAt = `${date}T10:00:00.000Z`;
const ranks = ['A1', 'A2', 'A3'] as const;

describe('DayPlan planning', () => {
    let service: DayPlanService;
    let repository: any;
    let taskService: any;
    let calendar: any;
    let plan: any;

    beforeEach(() => {
        plan = {_id: planId, user, date: new Date(`${date}T00:00:00Z`), status: 'BORRADOR',
            tasks: ids.map(task => ({task, decision: 'COMPROMETIDO'}))};
        repository = {
            findById: vi.fn(async () => structuredClone(plan)),
            find: vi.fn(async () => [structuredClone(plan)]),
            updatePartial: vi.fn(async (_id, patch) => ({...plan, ...patch})),
            create: vi.fn(async data => ({_id: planId, ...data})),
        };
        service = new DayPlanService(repository, DayPlanBaseSchema);
        taskService = {
            findById: vi.fn(async id => ({_id: id, user, title: 'Task title'})),
            updatePartial: vi.fn(async (id, patch) => ({_id: id, ...patch})),
        };
        calendar = {
            primaryBusy: vi.fn(async () => []),
            getPrimaryEvent: vi.fn(async () => null),
            createEvent: vi.fn(async ({event}) => ({...event, status: 'confirmed'})),
        };
        vi.spyOn(TaskServiceFactory, 'instance', 'get').mockReturnValue(taskService);
        vi.spyOn(DayPlanServiceFactory, 'instance', 'get').mockReturnValue(service);
        vi.spyOn(GoogleCalendarServiceFactory, 'instance', 'get').mockReturnValue(calendar);
    });
    afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

    it('does not inject defaults into PATCH', async () => {
        expect(DayPlanPatchSchema.parse({})).toEqual({});
        await service.updatePartial(planId, {tasks: [{task: ids[0], priority: null}]});
        expect(repository.updatePartial).toHaveBeenCalledWith(planId, {tasks: [{task: ids[0], priority: null}]});
    });

    it('rejects duplicate tasks, duplicate ranks and invalid priority values', () => {
        expect(DayPlanTasksSchema.safeParse([{task: ids[0]}, {task: ids[0]}]).success).toBe(false);
        expect(DayPlanTasksSchema.safeParse([{task: ids[0], priority: 'A1'}, {task: ids[1], priority: 'A1'}]).success).toBe(false);
        expect(DayPlanTasksSchema.safeParse([{task: ids[0], priority: 'A4'}]).success).toBe(false);
    });

    it('validates confirmation against the persisted tasks for status-only PATCH', async () => {
        await expect(service.updatePartial(planId, {status: 'CONFIRMADO'})).rejects.toThrow();
        plan.tasks = ids.map((task, index) => ({task, priority: ranks[index]}));
        await service.updatePartial(planId, {status: 'CONFIRMADO'});
        expect(repository.updatePartial).toHaveBeenCalledWith(planId, {status: 'CONFIRMADO'});
        plan.status = 'CONFIRMADO';
        await expect(service.updatePartial(planId, {tasks: [{task: ids[0], priority: 'A1'}]})).rejects.toThrow();
    });

    it('rejects foreign task references on mutation', async () => {
        taskService.findById.mockResolvedValue({_id: ids[0], user: 'other'});
        await expect(service.updatePartial(planId, {tasks: [{task: ids[0]}]})).rejects.toThrow();
        expect(repository.updatePartial).not.toHaveBeenCalled();
    });

    it('looks up only the authenticated user and selected UTC day', async () => {
        await service.planning(user, date);
        expect(repository.find.mock.calls[0][0].filters).toEqual([
            {field: 'user', operator: 'eq', value: user},
            {field: 'date', operator: 'gte', value: new Date(`${date}T00:00:00Z`)},
            {field: 'date', operator: 'lt', value: new Date('2030-01-03T00:00:00Z')},
        ]);
        repository.find.mockResolvedValue([]);
        expect(await service.planning(user, date)).toBeNull();
    });

    it('preserves every existing plan without calling Google or AI', async () => {
        for (const status of ['BORRADOR', 'VISTO', 'CONFIRMADO', 'CERRADO']) {
            plan.status = status;
            const result = await new DayPlanJob().generateForUser({userId: user, date: new Date(startAt)});
            expect(result).toEqual(plan);
        }
        expect(repository.updatePartial).not.toHaveBeenCalled();
        expect(repository.create).not.toHaveBeenCalled();
        expect(calendar.primaryBusy).not.toHaveBeenCalled();
    });

    it('ranks HIGH before MEDIUM before LOW, and urgent first within importance', async () => {
        taskService.find = vi.fn(async () => [
            {_id: ids[0], importance: 'LOW', urgent: true, priority: 'HIGH', valueScore: 999},
            {_id: ids[1], importance: 'HIGH', urgent: false},
            {_id: ids[2], importance: 'HIGH', urgent: true},
        ]);
        const tasks = await (new DayPlanJob() as any).fetchCandidateTasks(user);
        expect(tasks.map(task => task._id)).toEqual([ids[2], ids[1], ids[0]]);
    });

    it('offers exact one-hour slots, excludes the past and any overlapping busy interval', async () => {
        vi.useFakeTimers(); vi.setSystemTime(new Date(`${date}T09:30:00Z`));
        calendar.primaryBusy.mockResolvedValue([{start: `${date}T11:30:00Z`, end: `${date}T12:15:00Z`}]);
        const {slots} = await service.availableSlots(user, date);
        expect(slots[0]).toEqual({startAt, endAt: `${date}T11:00:00.000Z`});
        expect(slots.some(slot => /T(11|12):/.test(slot.startAt))).toBe(false);
        expect(slots.every(slot => Date.parse(slot.endAt) - Date.parse(slot.startAt) === 3600000)).toBe(true);
        expect(calendar.primaryBusy).toHaveBeenCalledWith(user, `${date}T00:00:00.000Z`, '2030-01-03T00:00:00.000Z');
    });

    it.each([
        [180, '2030-01-02T03:00:00.000Z', '2030-01-03T03:00:00.000Z'],
        [-330, '2030-01-01T18:30:00.000Z', '2030-01-02T18:30:00.000Z'],
        [210, '2030-01-02T03:30:00.000Z', '2030-01-03T03:30:00.000Z'],
        [-840, '2030-01-01T10:00:00.000Z', '2030-01-02T10:00:00.000Z'],
        [840, '2030-01-02T14:00:00.000Z', '2030-01-03T14:00:00.000Z'],
    ])('uses browser offset %i for local day boundaries', async (offset, from, to) => {
        const {slots} = await service.availableSlots(user, date, Number(offset));
        expect(calendar.primaryBusy).toHaveBeenCalledWith(user, from, to);
        expect(slots).toHaveLength(24);
        expect(slots[0].startAt).toBe(from);
        expect(slots[23].endAt).toBe(to);
        expect(slots.every(slot => new Date(Date.parse(slot.startAt) - Number(offset) * 60000).getUTCMinutes() === 0)).toBe(true);
    });

    it('excludes past and busy slots for half-hour offsets', async () => {
        vi.useFakeTimers(); vi.setSystemTime(new Date('2030-01-02T04:00:00Z'));
        calendar.primaryBusy.mockResolvedValue([{start: '2030-01-02T05:00:00Z', end: '2030-01-02T06:00:00Z'}]);
        const {slots} = await service.availableSlots(user, date, -330);
        expect(slots[0].startAt).toBe('2030-01-02T06:30:00.000Z');
    });

    it('defaults the offset to zero and rejects noninteger/out-of-range offsets', () => {
        expect(DayPlanAvailableSlotsSchema.parse({date}).utcOffsetMinutes).toBe(0);
        expect(DayPlanScheduleTaskSchema.parse({taskId: ids[0], startAt}).utcOffsetMinutes).toBe(0);
        expect(DayPlanAvailableSlotsSchema.parse({date, utcOffsetMinutes: '-330'}).utcOffsetMinutes).toBe(-330);
        for (const offset of [-841, 841, 1.5, 'invalid']) {
            expect(DayPlanAvailableSlotsSchema.safeParse({date, utcOffsetMinutes: offset}).success).toBe(false);
            expect(DayPlanScheduleTaskSchema.safeParse({taskId: ids[0], startAt, utcOffsetMinutes: offset}).success).toBe(false);
        }
    });

    it.each([
        [-330, '2030-01-02T18:30:00Z', '2030-01-02T18:30:00.000Z', '2030-01-03T18:30:00.000Z'],
        [210, '2030-01-03T02:30:00Z', '2030-01-02T03:30:00.000Z', '2030-01-03T03:30:00.000Z'],
    ])('schedules independently of plan date with offset %i and re-reads the plan', async (offset, booking, from, to) => {
        plan.date = new Date('2030-01-01T00:00:00Z');
        taskService.updatePartial.mockImplementation(async (id, patch) => {
            plan.tasks[0].task = {_id: id, title: 'Task title', ...patch};
        });
        const result = await service.scheduleTask(user, planId, {taskId: ids[0], startAt: String(booking), utcOffsetMinutes: Number(offset)});
        expect(calendar.primaryBusy).toHaveBeenCalledWith(user, from, to);
        expect(repository.findById).toHaveBeenCalledTimes(2);
        expect(result).toEqual(plan);
        expect(result?.tasks?.[0].task.scheduledDate).toEqual(new Date(booking));
        expect(result?.date).toEqual(new Date('2030-01-01T00:00:00Z'));
    });

    it('rejects a UTC whole hour when it is not a local whole hour', async () => {
        await expect(service.scheduleTask(user, planId, {taskId: ids[0], startAt, utcOffsetMinutes: -330})).rejects.toThrow();
        expect(calendar.createEvent).not.toHaveBeenCalled();
    });

    it('fails closed for Google errors and all-day busy intervals', async () => {
        calendar.primaryBusy.mockRejectedValueOnce(new Error('offline'));
        await expect(service.availableSlots(user, date)).rejects.toThrow('offline');
        calendar.primaryBusy.mockResolvedValue([{start: `${date}T00:00:00Z`, end: '2030-01-03T00:00:00Z'}]);
        expect(await service.availableSlots(user, date)).toEqual({slots: []});
    });

    it('validates ownership, membership and exact local hour before scheduling', async () => {
        plan.user = 'other';
        await expect(service.scheduleTask(user, planId, {taskId: ids[0], startAt})).rejects.toThrow();
        plan.user = user;
        await expect(service.scheduleTask(user, planId, {taskId: planId, startAt})).rejects.toThrow();
        await expect(service.scheduleTask(user, planId, {taskId: ids[0], startAt: `${date}T10:30:00Z`})).rejects.toThrow();

        taskService.findById.mockResolvedValue({_id: ids[0], user: 'other'});
        await expect(service.scheduleTask(user, planId, {taskId: ids[0], startAt})).rejects.toThrow();
        expect(calendar.createEvent).not.toHaveBeenCalled();
    });

    it('checks fresh availability and persists through TaskService without defaults', async () => {
        await service.scheduleTask(user, planId, {taskId: ids[0], startAt});
        expect(calendar.primaryBusy).toHaveBeenCalledOnce();
        const event = calendar.createEvent.mock.calls[0][0].event;
        expect(event).toMatchObject({calendarId: 'primary', summary: 'Task title',
            start: {dateTime: startAt}, end: {dateTime: `${date}T11:00:00.000Z`}});
        expect(taskService.updatePartial).toHaveBeenCalledWith(ids[0], {calendarEventId: event.id, scheduledDate: new Date(startAt)});
    });

    it('does not create events when a slot became occupied or Google is unavailable', async () => {
        calendar.primaryBusy.mockResolvedValueOnce([{start: startAt, end: `${date}T11:00:00Z`}]);
        await expect(service.scheduleTask(user, planId, {taskId: ids[0], startAt})).rejects.toThrow();
        calendar.primaryBusy.mockRejectedValueOnce(new Error('offline'));
        await expect(service.scheduleTask(user, planId, {taskId: ids[0], startAt})).rejects.toThrow();
        expect(calendar.createEvent).not.toHaveBeenCalled();
    });

    it('recovers a Google event after DB failure, without creating a duplicate', async () => {
        taskService.updatePartial.mockRejectedValueOnce(new Error('database unavailable'));
        await expect(service.scheduleTask(user, planId, {taskId: ids[0], startAt})).rejects.toThrow('database unavailable');
        const event = calendar.createEvent.mock.calls[0][0].event;
        calendar.getPrimaryEvent.mockResolvedValue(event);
        expect(await service.scheduleTask(user, planId, {taskId: ids[0], startAt})).toEqual(plan);
        expect(calendar.createEvent).toHaveBeenCalledOnce();
        taskService.findById.mockResolvedValue({_id: ids[0], user, calendarEventId: event.id, scheduledDate: startAt});
        repository.findById.mockClear();
        expect(await service.scheduleTask(user, planId, {taskId: ids[0], startAt})).toEqual(plan);
        expect(repository.findById).toHaveBeenCalledTimes(2);
        await expect(service.scheduleTask(user, planId, {taskId: ids[0], startAt: `${date}T12:00:00Z`})).rejects.toThrow();
        expect(calendar.createEvent).toHaveBeenCalledOnce();
    });

    it('retains populated titles and nested project names in output', () => {
        const output = DayPlanSchema.parse({...plan, user: {_id: user, username: 'user'}, tasks: [{
            task: {_id: ids[0], title: 'Task', project: {_id: ids[1], name: 'Project'}}, priority: 'A1',
        }]});
        expect(output.tasks?.[0].task.project?.name).toBe('Project');
        expect(output.tasks?.[0].task.title).toBe('Task');
    });

    it('registers routes with real Fastify validation and enforces permissions', async () => {
        const app = Fastify();
        const assertPermission = vi.fn();
        app.addHook('onRequest', async request => {
            (request as any).rbac = {userId: user, assertPermission};
        });
        await app.register(DayPlanRoutes);
        try {
            repository.find.mockResolvedValue([]);
            const result = await app.inject('/api/day-plans/planning?date=2030-01-02');
            expect(result.statusCode).toBe(200);
            expect(result.json()).toBeNull();
            expect(assertPermission).toHaveBeenCalledWith('dayplan:view');
            expect((await app.inject('/api/day-plans/planning?date=invalid')).statusCode).toBe(400);
            const slots = await app.inject(`/api/day-plans/available-slots?date=${date}`);
            expect(slots.statusCode).toBe(200);
            expect(slots.json().slots).toHaveLength(24);
            const localSlots = await app.inject(`/api/day-plans/available-slots?date=${date}&utcOffsetMinutes=-330`);
            expect(localSlots.statusCode).toBe(200);
            expect(localSlots.json().slots[0].startAt).toBe('2030-01-01T18:30:00.000Z');
            for (const offset of ['-841', '841', '0.5', 'invalid']) {
                expect((await app.inject(`/api/day-plans/available-slots?date=${date}&utcOffsetMinutes=${offset}`)).statusCode).toBe(400);
            }
        } finally { await app.close(); }
    });
});

describe('Google availability fails closed', () => {
    afterEach(() => vi.restoreAllMocks());
    it.each([{}, {calendars: {primary: {errors: [{reason: 'forbidden'}], busy: []}}},
        {calendars: {primary: {busy: [{start: 'invalid', end: 'invalid'}]}}}])('rejects incomplete/error FreeBusy responses', async result => {
        const calendar = new GoogleCalendarService();
        vi.spyOn(calendar as any, 'resolveConnection').mockResolvedValue({});
        vi.spyOn(calendar as any, 'getAccessToken').mockResolvedValue('token');
        vi.spyOn(calendar as any, 'calendarFetch').mockResolvedValue(result);
        await expect(calendar.primaryBusy(user, startAt, '2030-01-03T00:00:00Z')).rejects.toThrow();
    });
});
