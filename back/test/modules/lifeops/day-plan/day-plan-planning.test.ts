import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import Fastify from 'fastify';
import {AiProviderFactory} from '@drax/ai-back';
import DayPlanJobFactory from '../../../../src/modules/lifeops/factory/services/DayPlanJobFactory.js';
import DayPlanService from '../../../../src/modules/lifeops/services/DayPlanService.js';
import DayPlanJob from '../../../../src/modules/lifeops/jobs/DayPlanJob.js';
import DayPlanServiceFactory from '../../../../src/modules/lifeops/factory/services/DayPlanServiceFactory.js';
import TaskServiceFactory from '../../../../src/modules/lifeops/factory/services/TaskServiceFactory.js';
import TaskStatusServiceFactory from '../../../../src/modules/lifeops/factory/services/TaskStatusServiceFactory.js';
import {TaskStatusBaseSchema} from '../../../../src/modules/lifeops/schemas/TaskStatusSchema.js';
import GoogleCalendarServiceFactory from '../../../../src/modules/google/factory/GoogleCalendarServiceFactory.js';
import GoogleCalendarService from '../../../../src/modules/google/services/GoogleCalendarService.js';
import DayPlanRoutes from '../../../../src/modules/lifeops/routes/DayPlanRoutes.js';
import DayPlanMongoRepository from '../../../../src/modules/lifeops/repository/mongo/DayPlanMongoRepository.js';
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
        let taskStatusService: any;
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
        taskStatusService = {fetchAll: vi.fn(async () => [
                    {name: 'Pendiente'}, {name: 'Trabajando', startsTask: true},
                    {name: 'Finalizada', completesTask: true}, {name: 'Guardada', archivesTask: true},
                ])};
                vi.spyOn(TaskStatusServiceFactory, 'instance', 'get').mockReturnValue(taskStatusService);
                vi.spyOn(TaskServiceFactory, 'instance', 'get').mockReturnValue(taskService);
        vi.spyOn(DayPlanServiceFactory, 'instance', 'get').mockReturnValue(service);
        vi.spyOn(GoogleCalendarServiceFactory, 'instance', 'get').mockReturnValue(calendar);
    });
    afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

    it('populates task context so card properties display names instead of IDs', () => {
        const repository = new DayPlanMongoRepository();
        expect((repository as any)._populateFields).toContainEqual({
            path: 'tasks.task', populate: [{path: 'project'}, {path: 'goals'}, {path: 'user'}],
        });
    });

    it('does not inject defaults into PATCH', async () => {
        expect(DayPlanPatchSchema.parse({})).toEqual({});
        await service.updatePartial(planId, {tasks: [{task: ids[0], priority: null}]});
        expect(repository.updatePartial).toHaveBeenCalledWith(planId, {tasks: [{task: ids[0], priority: null}], status: 'BORRADOR'});
    });

    it.each(['A1', 'A2', 'A3', 'DESEABLE', 'COMPROMETIDO'])('starts selected %s tasks through their service using the configured status', async selection => {
        taskService.findById.mockImplementation(async id => ({_id: id, user, status: 'Pendiente'}));
        const entry = {task: ids[0], ...(selection.startsWith('A') ? {priority: selection} : {decision: selection})};
        await service.updatePartial(planId, {tasks: [entry, {task: ids[1], decision: 'PENDIENTE'}, {task: ids[2], decision: 'DESCARTADO'}]});
        expect(taskService.updatePartial).toHaveBeenCalledExactlyOnceWith(ids[0], {status: 'Trabajando'});
    });

    it.each([
        {status: 'Trabajando'}, {status: 'Finalizada'}, {status: 'Guardada'},
        {status: 'Pendiente', completedAt: new Date()}, {status: 'Pendiente', archivedAt: new Date()},
    ])('does not restart working, completed or archived tasks: %j', async state => {
        taskService.findById.mockImplementation(async id => ({_id: id, user, ...state}));
        await service.updatePartial(planId, {tasks: [{task: ids[0], priority: 'A1'}]});
        expect(taskService.updatePartial).not.toHaveBeenCalled();
    });

    it('keeps unselected and status-only updates free from task state changes', async () => {
        await service.updatePartial(planId, {status: 'VISTO'});
        await service.updatePartial(planId, {tasks: [{task: ids[0], decision: 'PENDIENTE'}]});
        expect(taskStatusService.fetchAll).not.toHaveBeenCalled();
        expect(taskService.updatePartial).not.toHaveBeenCalled();
    });

    it('preserves task states if no working status is configured', async () => {
        taskStatusService.fetchAll.mockResolvedValue([{name: 'Pendiente'}]);
        await service.updatePartial(planId, {tasks: [{task: ids[0], decision: 'DESEABLE'}]});
        expect(taskService.updatePartial).not.toHaveBeenCalled();
    });

    it('starts selected tasks on create and full update as well', async () => {
        repository.update = vi.fn(async (_id, data) => ({...plan, ...data}));
        const payload = {user, date: plan.date, tasks: [{task: ids[0], priority: 'A1' as const}]};
        await service.create(payload);
        await service.update(planId, payload);
        expect(taskService.updatePartial).toHaveBeenCalledTimes(2);
        expect(taskService.updatePartial).toHaveBeenCalledWith(ids[0], {status: 'Trabajando'});
    });

    it('does not persist a selection when starting its task fails', async () => {
        taskService.updatePartial.mockRejectedValue(new Error('failed task update'));
        await expect(service.updatePartial(planId, {tasks: [{task: ids[0], priority: 'A1'}]})).rejects.toThrow('failed task update');
        expect(repository.updatePartial).not.toHaveBeenCalled();
    });

    it('does not inject startsTask into omitted status inputs', () => {
        expect(TaskStatusBaseSchema.parse({name: 'Custom'})).not.toHaveProperty('startsTask');
        expect(TaskStatusBaseSchema.parse({name: 'Custom', startsTask: false}).startsTask).toBe(false);
    });

    it('rejects duplicate tasks, duplicate ranks and invalid priority values', () => {
        expect(DayPlanTasksSchema.safeParse([{task: ids[0]}, {task: ids[0]}]).success).toBe(false);
        expect(DayPlanTasksSchema.safeParse([{task: ids[0], priority: 'A1'}, {task: ids[1], priority: 'A1'}]).success).toBe(false);
        expect(DayPlanTasksSchema.safeParse([{task: ids[0], priority: 'A4'}]).success).toBe(false);
    });

    it('validates confirmation against the persisted tasks for status-only PATCH', async () => {
        expect((await service.updatePartial(planId, {status: 'CONFIRMADO'})).status).toBe('BORRADOR');
        plan.tasks = ids.map((task, index) => ({task, priority: ranks[index]}));
        await service.updatePartial(planId, {status: 'CONFIRMADO'});
        expect(repository.updatePartial).toHaveBeenCalledWith(planId, {status: 'CONFIRMADO'});
        plan.status = 'CONFIRMADO';
        expect((await service.updatePartial(planId, {tasks: [{task: ids[0], priority: 'A1'}]})).status).toBe('BORRADOR');
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
            {_id: ids[0], user, importance: 'LOW', urgent: true, priority: 'HIGH', valueScore: 999},
            {_id: ids[1], user, importance: 'HIGH', urgent: false},
            {_id: ids[2], user, importance: 'HIGH', urgent: true},
        ]);
        const tasks = await (new DayPlanJob() as any).fetchCandidateTasks(user);
        expect(tasks.map(task => task._id)).toEqual([ids[2], ids[1], ids[0]]);
    });

    it.each(['more', 'other'] as const)('merges %s against fresh decisions, preserving the rest', async mode => {
        plan.tasks = [{task: ids[0]}, {task: ids[1]}];
        plan.events = [{title: 'keep'}];
        vi.spyOn(DayPlanJobFactory.instance, 'selectTaskProposals').mockImplementation(async () => {
            plan.tasks[0] = {task: ids[0], priority: 'A1', decision: 'COMPROMETIDO'};
            plan.habits = [{habit: 'keep'}];
            return [{_id: ids[2]}] as any;
        });
        const result = await service.proposals(user, planId, {mode});
        expect(result.tasks?.map(item => item.task)).toEqual(mode === 'more' ? ids : [ids[0], ids[2]]);
        expect(result.tasks?.[0].priority).toBe('A1');
        expect(result.events).toEqual(plan.events);
        expect(result.habits).toEqual(plan.habits);
    });

    it('preserves ranks, desirable, committed and discarded entries on other', async () => {
        plan.tasks = ids.map((task, index) => ({task, priority: ranks[index]}));
        plan.tasks.push({task: '666666666666666666666666', decision: 'DESEABLE'},
            {task: '777777777777777777777777', decision: 'COMPROMETIDO'},
            {task: '888888888888888888888888', decision: 'DESCARTADO'});
        vi.spyOn(DayPlanJobFactory.instance, 'selectTaskProposals').mockResolvedValue([{_id: '999999999999999999999999'}] as any);
        const result = await service.proposals(user, planId, {mode: 'other'});
        expect(result.tasks?.slice(0, 6)).toEqual(plan.tasks);
        expect(result.status).toBe('CONFIRMADO');
    });

    it('does not remove proposals when there are no fresh pending tasks', async () => {
        vi.spyOn(DayPlanJobFactory.instance, 'selectTaskProposals').mockResolvedValue([{_id: planId}] as any);
        taskService.findById.mockResolvedValue({_id: planId, user, completedAt: new Date()});
        expect(await service.proposals(user, planId, {mode: 'other'})).toEqual(plan);
        expect(repository.updatePartial).not.toHaveBeenCalled();
        plan.user = 'other';
        await expect(service.proposals(user, planId, {mode: 'more'})).rejects.toThrow();
    });

    it('uses AI IDs, deduplicates, filters candidates and falls back on invalid output', async () => {
        const candidates = ids.map((_id, index) => ({_id, user, importance: index === 0 ? 'HIGH' : 'LOW'}));
        taskService.find = vi.fn().mockResolvedValue([...candidates,
            {_id: planId, user: 'foreign'}, {_id: '666666666666666666666666', user, completedAt: new Date()}]);
        const prompt = vi.fn().mockResolvedValue({output: {taskIds: [ids[2], ids[2]]}});
        vi.spyOn(AiProviderFactory, 'instance').mockReturnValue({prompt} as any);
        const job = new DayPlanJob();
        expect((await job.selectTaskProposals(user, {date: plan.date})).map(t => t._id)).toEqual([ids[2]]);
        for (const output of [{taskIds: [planId]}, {taskIds: []}, {taskIds: Array(6).fill(ids[0])}, 'bad json']) {
            prompt.mockResolvedValue({output});
            expect((await job.selectTaskProposals(user, {date: plan.date})).map(t => t._id)).toEqual(ids);
        }
        prompt.mockRejectedValue(new Error('offline'));
        expect((await job.selectTaskProposals(user, {date: plan.date}, [ids[0]])).map(t => t._id)).toEqual(ids.slice(1));
    });

    it('offers only owned unfinished previous-calendar-day selections, deduplicated and without ranks', async () => {
        const previous = {...plan, date: new Date('2030-01-01T00:00:00Z'), tasks: [
            {task: ids[0], priority: 'A1'}, {task: ids[0], decision: 'DESEABLE'},
            {task: ids[1], priority: 'A2'}, {task: ids[2], decision: 'DESEABLE'},
            {task: planId, decision: 'DESCARTADO'}, {task: '666666666666666666666666'},
        ]};
        repository.find.mockResolvedValue([previous]);
        taskService.find = vi.fn().mockResolvedValue([]);
        taskService.findById.mockImplementation(async id => ({_id: id,
            user: id === ids[2] ? 'foreign' : user,
            completedAt: id === ids[1] ? new Date() : null}));
        const job = new DayPlanJob();
        expect((await job.selectTaskProposals(user, {date: plan.date})).map(t => t._id)).toEqual([ids[0]]);
        expect(taskService.findById).not.toHaveBeenCalledWith(planId);
        expect(repository.find.mock.calls[0][0].filters).toContainEqual({
            field: 'date', operator: 'gte', value: previous.date,
        });
        expect(await job.selectTaskProposals(user, {date: plan.date}, [ids[0]])).toEqual([]);
        previous.date = new Date('2029-12-31T00:00:00Z');
        expect(await job.selectTaskProposals(user, {date: plan.date})).toEqual([]);
    });

    it('generates previous month selections as pending proposals, never automatic ranks', async () => {
        const target = new Date('2030-02-01T00:00:00Z');
        repository.find.mockResolvedValueOnce([]).mockResolvedValue([{
            ...plan, date: new Date('2030-01-31T00:00:00Z'),
            tasks: [{task: ids[0], priority: 'A3', decision: 'COMPROMETIDO'}],
        }]);
        taskService.find = vi.fn().mockResolvedValue([]);
        const job = new DayPlanJob();
        for (const method of ['fetchCalendarEvents', 'fetchDueHabits', 'fetchGoals', 'fetchProjects', 'generateSuggestions']) {
            vi.spyOn(job as any, method).mockResolvedValue([]);
        }
        const result = await job.generateForUser({userId: user, date: target});
        expect(result.tasks).toEqual([{task: ids[0], decision: 'PENDIENTE'}]);
        expect(result.status).toBe('BORRADOR');
    });

    it.each(['more', 'other'] as const)('keeps today-only exclusions on %s without mutating Task', async mode => {
        plan.tasks = [{task: ids[0], decision: 'DESCARTADO'}];
        const select = vi.spyOn(DayPlanJobFactory.instance, 'selectTaskProposals')
            .mockResolvedValue([{_id: ids[0]}, {_id: ids[1]}] as any);
        const result = await service.proposals(user, planId, {mode});
        expect(select.mock.calls[0][2]).toEqual([ids[0]]);
        expect(result.tasks).toEqual([{task: ids[0], decision: 'DESCARTADO'},
            {task: ids[1], decision: 'PENDIENTE'}]);
        expect(taskService.updatePartial).not.toHaveBeenCalled();
    });

    it('uses AI selection during initial generation and retains its pending decisions', async () => {
        repository.find.mockResolvedValue([]);
        taskService.find = vi.fn().mockResolvedValue(ids.map(_id => ({_id, user, title: 'Real task'})));
        const prompt = vi.fn().mockResolvedValue({output: JSON.stringify({taskIds: [ids[1]]})});
        vi.spyOn(AiProviderFactory, 'instance').mockReturnValue({prompt} as any);
        const job = new DayPlanJob();
        vi.spyOn(job as any, 'fetchCalendarEvents').mockResolvedValue([]);
        vi.spyOn(job as any, 'fetchDueHabits').mockResolvedValue([]);
        vi.spyOn(job as any, 'fetchGoals').mockResolvedValue([]);
        vi.spyOn(job as any, 'fetchProjects').mockResolvedValue([]);
        const result = await job.generateForUser({userId: user, date: plan.date});
        expect(result.tasks).toEqual([{task: ids[1], decision: 'PENDIENTE'}]);
        expect(result.status).toBe('BORRADOR');
        expect(prompt).toHaveBeenCalledOnce();
    });

    it('validates the proposals contract using Fastify schemas', async () => {
        const app = Fastify();
        app.addHook('onRequest', async request => {
            (request as any).rbac = {userId: user, assertPermission: vi.fn()};
        });
        await app.register(DayPlanRoutes);
        const proposals = vi.spyOn(service, 'proposals').mockResolvedValue({...plan,
            user: {_id: user, username: 'user'}, tasks: []});
        try {
            const url = `/api/day-plans/${planId}/proposals`;
            expect((await app.inject({method: 'POST', url, payload: {mode: 'other'}})).statusCode).toBe(200);
            expect(proposals).toHaveBeenCalledWith(user, planId, {mode: 'other'});
            for (const payload of [{}, {mode: 'invalid'}]) {
                expect((await app.inject({method: 'POST', url, payload})).statusCode).toBe(400);
            }
            expect((await app.inject({method: 'POST', url: '/api/day-plans/invalid/proposals', payload: {mode: 'more'}})).statusCode).toBe(400);
        } finally { await app.close(); }
    });

    it('derives state on create and normalizes legacy closed plans on edits', async () => {
        expect((await service.create({...plan, status: 'CERRADO'})).status).toBe('BORRADOR');
        plan.tasks = ids.map((task, index) => ({task, priority: ranks[index]}));
        expect((await service.create({...plan, status: 'BORRADOR'})).status).toBe('CONFIRMADO');
        plan.status = 'CERRADO';
        expect((await service.updatePartial(planId, {tasks: []})).status).toBe('BORRADOR');
        repository.update = vi.fn(async (_id, data) => ({...plan, ...data}));
        expect((await service.update(planId, {...plan, status: 'BORRADOR'})).status).toBe('CONFIRMADO');
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

    it('retains all selectable card properties using the task output schema', () => {
        const task = {
            _id: ids[0], title: 'Task', description: 'Details', priority: 'HIGH', importance: 'HIGH',
            status: 'TODO', urgent: false, source: 'manual', type: 'Work', lifeArea: 'Career',
            project: {_id: ids[1], name: 'Project'}, goals: [{_id: ids[2], name: 'Goal'}],
            user: {_id: user, username: 'user'}, tags: ['planning'],
            valueScore: 0, motivationScore: 5, effortScore: 3,
            dueDate: new Date(startAt), scheduledDate: new Date(startAt), completedAt: null,
            createdAt: new Date(startAt), updatedAt: new Date(startAt), archivedAt: null,
            redmineIssueId: '123', emailMessageId: 'message', calendarEventId: 'event',
            notes: [{note: 'A note'}], statusHistory: [{newStatus: 'TODO'}],
        };
        const output = DayPlanSchema.parse({...plan, user: {_id: user, username: 'user'}, tasks: [{task, priority: 'A1'}]});
        expect(output.tasks?.[0].task).toMatchObject(task);
        expect(output.tasks?.[0].priority).toBe('A1');
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
            const cardTask = {_id: ids[0], title: 'Card', status: 'TODO', priority: 'HIGH', urgent: false, valueScore: 0,
                goals: [{_id: ids[1], name: 'Goal'}], user: {_id: user, username: 'user'}, notes: [{note: 'Note'}]};
            repository.find.mockResolvedValue([{...plan, user: {_id: user, username: 'user'}, tasks: [{task: cardTask, priority: 'A1'}]}]);
            const populated = await app.inject(`/api/day-plans/planning?date=${date}`);
            expect(populated.statusCode).toBe(200);
            expect(populated.json().tasks[0].task).toMatchObject(cardTask);
            expect(populated.json().tasks[0].priority).toBe('A1');
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
