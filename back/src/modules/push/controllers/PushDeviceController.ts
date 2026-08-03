
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
    guestLabel: z.string().trim().max(120).optional(),
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

        this.userFilter = false;
        this.userSetter = true;
        this.userAssert = false;
    }

    async register(request: CustomRequest, reply: FastifyReply) {
        try {
            const input = PushDeviceRegisterSchema.parse(request.body ?? {});
            const userId = request.rbac?.userId ?? request.authUser?.id ?? null;
            const isGuest = !userId;
            const payload = {
                user: userId ?? null,
                isGuest,
                guestLabel: isGuest ? input.guestLabel : undefined,
                platform: input.platform,
                token: input.token,
                deviceName: input.deviceName,
                enabled: input.enabled,
                lastSeenAt: new Date(),
            } as IPushDeviceBase;

            const existing = await this.service.findOneBy("token", input.token);
            if (existing?._id) {
                return reply.send(await this.service.updatePartial(existing._id, {
                    ...payload,
                    guestLabel: isGuest ? input.guestLabel : existing.guestLabel,
                }));
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
