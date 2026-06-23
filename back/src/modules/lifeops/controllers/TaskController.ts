
import TaskServiceFactory from "../factory/services/TaskServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import TaskPermissions from "../permissions/TaskPermissions.js";
import type {ITask, ITaskBase} from "../interfaces/ITask";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {NotFoundError} from "@drax/common-back";
import TaskTriageServiceFactory from "../factory/services/TaskTriageServiceFactory.js";

class TaskController extends AbstractFastifyController<ITask, ITaskBase, ITaskBase>   {

    constructor() {
        super(TaskServiceFactory.instance, TaskPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    async triage(request: CustomRequest, reply: FastifyReply) {
        try {
            this.assertUpdatePermission(request)
            if (!request.params.id) {
                return reply.status(400).send({error: 'BAD REQUEST'})
            }

            const task = await TaskServiceFactory.instance.findById(request.params.id)
            if (!task) {
                throw new NotFoundError()
            }

            if (!request.rbac.hasSomePermission([(this.permission as any).All, (this.permission as any).UpdateAll])) {
                this.assertUser(task, request.rbac)
            }
            this.assertTenant(task, request.rbac)

            const result = await TaskTriageServiceFactory.instance.triageTask(request.params.id, {
                ip: request.ip,
                userAgent: request.headers["user-agent"],
                tenant: request.rbac?.tenantId ?? null,
                user: request.rbac?.userId ?? null
            })

            return reply.send(result.task)
        } catch (e) {
            this.handleError(e, reply)
        }
    }

}

export default TaskController;
export {
    TaskController
}
