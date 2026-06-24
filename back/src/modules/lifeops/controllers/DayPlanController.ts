
import DayPlanServiceFactory from "../factory/services/DayPlanServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import DayPlanPermissions from "../permissions/DayPlanPermissions.js";
import type {IDayPlan, IDayPlanBase} from "../interfaces/IDayPlan";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {BadRequestError} from "@drax/common-back";
import DayPlanJobFactory from "../factory/services/DayPlanJobFactory.js";

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
