
import PushDeviceServiceFactory from "../factory/services/PushDeviceServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import PushDevicePermissions from "../permissions/PushDevicePermissions.js";
import type {IPushDevice, IPushDeviceBase} from "../interfaces/IPushDevice";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {z} from "zod";

const PushDeviceRegisterSchema = z.object({
    platform: z.enum(["android", "ios", "web"]),
    token: z.string().min(1, "validation.required"),
    deviceName: z.string().optional(),
    enabled: z.boolean().optional().default(true),
});

class PushDeviceController extends AbstractFastifyController<IPushDevice, IPushDeviceBase, IPushDeviceBase>   {

    constructor() {
        super(PushDeviceServiceFactory.instance, PushDevicePermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    async register(request: CustomRequest, reply: FastifyReply) {
        try {
            request?.rbac.assertAuthenticated()

            const input = PushDeviceRegisterSchema.parse(request.body ?? {});
            const userId = request.rbac.userId;
            const payload = {
                user: userId,
                platform: input.platform,
                token: input.token,
                deviceName: input.deviceName,
                enabled: input.enabled,
                lastSeenAt: new Date(),
            } as IPushDeviceBase;

            const existing = await this.service.findOneBy("token", input.token);
            if (existing?._id) {
                return reply.send(await this.service.updatePartial(existing._id, payload));
            }

            return reply.send(await this.service.create(payload));
        } catch (e: any) {
            if (e?.name === "ZodError") {
                return reply.status(400).send({
                    message: e?.message || "Push device validation error",
                });
            }

            this.handleError(e, reply)
        }
    }

}

export default PushDeviceController;
export {
    PushDeviceController
}
