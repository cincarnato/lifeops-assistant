
import TaskScheduleServiceFactory from "../factory/services/TaskScheduleServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TaskSchedulePermissions from "../permissions/TaskSchedulePermissions.js";
import type {ITaskSchedule, ITaskScheduleBase} from "../interfaces/ITaskSchedule";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {NotFoundError} from "@drax/common-back";

class TaskScheduleController extends AbstractFastifyController<ITaskSchedule, ITaskScheduleBase, ITaskScheduleBase>   {

    constructor() {
        super(TaskScheduleServiceFactory.instance, TaskSchedulePermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    async activate(request: CustomRequest, reply: FastifyReply) {
        try {
            this.assertUpdatePermission(request)
            const schedule = await this.resolveOwnedSchedule(request)
            return reply.send(await TaskScheduleServiceFactory.instance.activate(schedule._id))
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    async deactivate(request: CustomRequest, reply: FastifyReply) {
        try {
            this.assertUpdatePermission(request)
            const schedule = await this.resolveOwnedSchedule(request)
            return reply.send(await TaskScheduleServiceFactory.instance.deactivate(schedule._id))
        } catch (e) {
            this.handleError(e, reply)
        }
    }

    private async resolveOwnedSchedule(request: CustomRequest): Promise<ITaskSchedule> {
        if (!request.params.id) {
            throw new Error("taskSchedule.id.required")
        }

        const schedule = await TaskScheduleServiceFactory.instance.findById(request.params.id)
        if (!schedule) {
            throw new NotFoundError()
        }

        if (!request.rbac.hasSomePermission([(this.permission as any).All, (this.permission as any).UpdateAll])) {
            this.assertUser(schedule, request.rbac)
        }
        this.assertTenant(schedule, request.rbac)

        return schedule
    }

}

export default TaskScheduleController;
export {
    TaskScheduleController
}
