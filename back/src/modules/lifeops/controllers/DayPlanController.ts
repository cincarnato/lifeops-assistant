
import DayPlanServiceFactory from "../factory/services/DayPlanServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import DayPlanPermissions from "../permissions/DayPlanPermissions.js";
import TaskPermissions from '../permissions/TaskPermissions.js';
import type {IDayPlan, IDayPlanBase} from "../interfaces/IDayPlan";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {BadRequestError, ZodErrorToValidationError} from "@drax/common-back";
import {z} from 'zod';
import DayPlanJobFactory from "../factory/services/DayPlanJobFactory.js";
import {DayPlanProposalsSchema, DayPlanPlanningSchema, DayPlanAvailableSlotsSchema, DayPlanScheduleTaskSchema, DayPlanIdSchema} from '../schemas/DayPlanSchema.js';

class DayPlanController extends AbstractFastifyController<IDayPlan, IDayPlanBase, IDayPlanBase>   {

    constructor() {
        super(DayPlanServiceFactory.instance, DayPlanPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    async planning(request: CustomRequest, reply: FastifyReply) {
        try {
            this.assertReadPermission(request);
            const {date} = this.parse(DayPlanPlanningSchema, request.query);
            return reply.send(await DayPlanServiceFactory.instance.planning(this.userId(request), date));
        } catch (error) { this.handleError(error, reply); }
    }

    async availableSlots(request: CustomRequest, reply: FastifyReply) {
        try {
            this.assertReadPermission(request);
            const {date, utcOffsetMinutes} = this.parse(DayPlanAvailableSlotsSchema, request.query);
            return reply.send(await DayPlanServiceFactory.instance.availableSlots(this.userId(request), date, utcOffsetMinutes));
        } catch (error) { this.handleError(error, reply); }
    }

    async generate(request: CustomRequest, reply: FastifyReply) {
        try {
            this.assertCreatePermission(request);
            const {date} = this.parse(DayPlanPlanningSchema, request.body);
            return reply.send(await DayPlanJobFactory.instance.generateForUser({
                userId: this.userId(request), date: new Date(`${date}T00:00:00.000Z`),
                ip: request.ip, userAgent: request.headers['user-agent'], tenant: request.rbac?.tenantId ?? null,
            }));
        } catch (error) { this.handleError(error, reply); }
    }

    async proposals(request: CustomRequest, reply: FastifyReply) {
        try {
            this.assertUpdatePermission(request);
            const {id} = this.parse(DayPlanIdSchema, request.params);
            const input = this.parse(DayPlanProposalsSchema, request.body);
            return reply.send(await DayPlanServiceFactory.instance.proposals(this.userId(request), id, input));
        } catch (error) { this.handleError(error, reply); }
    }

    async scheduleTask(request: CustomRequest, reply: FastifyReply) {
        try {
            this.assertUpdatePermission(request);
            request.rbac.assertPermission(TaskPermissions.Update);
            const {id} = this.parse(DayPlanIdSchema, request.params);
            const input = this.parse(DayPlanScheduleTaskSchema, request.body);
            return reply.send(await DayPlanServiceFactory.instance.scheduleTask(this.userId(request), id, input));
        } catch (error) { this.handleError(error, reply); }
    }

    private parse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
        const result = schema.safeParse(data);
        if (!result.success) throw ZodErrorToValidationError(result.error, data);
        return result.data;
    }

    private userId(request: CustomRequest): string {
        const id = request.rbac?.userId;
        if (!id) throw new BadRequestError('user.required');
        return String(id);
    }

    async generateToday(request: CustomRequest, reply: FastifyReply) {
        try {
            this.assertCreatePermission(request)

            const userId = request.rbac?.userId
            if (!userId) {
                throw new BadRequestError("user.required")
            }

            const dayPlan = await DayPlanJobFactory.instance.generateForUser({
                userId,
                date: new Date(),
                ip: request.ip,
                userAgent: request.headers["user-agent"],
                tenant: request.rbac?.tenantId ?? null
            })

            return reply.send(dayPlan)
        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default DayPlanController;
export {
    DayPlanController
}
