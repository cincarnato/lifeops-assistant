
import PushMessageServiceFactory from "../factory/services/PushMessageServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import PushMessagePermissions from "../permissions/PushMessagePermissions.js";
import type {IPushMessage, IPushMessageBase} from "../interfaces/IPushMessage";
import PushDeviceServiceFactory from "../factory/services/PushDeviceServiceFactory.js";
import type {FastifyReply} from "fastify";
import type {CustomRequest} from "@drax/crud-back/src/controllers/AbstractFastifyController";
import {NotFoundError} from "@drax/common-back";
import {z} from "zod";
import FirebasePushServiceFactory from "../factory/services/FirebasePushServiceFactory.js";

const PushMessageTestSchema = z.object({
    pushDeviceId: z.string().min(1, "validation.required"),
    title: z.string().min(1, "validation.required"),
    body: z.string().min(1, "validation.required"),
    type: z.string().optional().default("test"),
});

class PushMessageController extends AbstractFastifyController<IPushMessage, IPushMessageBase, IPushMessageBase>   {

    constructor() {
        super(PushMessageServiceFactory.instance, PushMessagePermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = true;
        this.userSetter = true;
        this.userAssert = true;
    }

    async sendTest(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(PushMessagePermissions.Create);

            const input = PushMessageTestSchema.parse(request.body ?? {});
            const device = await PushDeviceServiceFactory.instance.findById(input.pushDeviceId);
            if (!device) {
                throw new NotFoundError();
            }

            const user = this.getId(device.user);
            const sentAt = new Date();
            const payload = {
                user,
                title: input.title,
                body: input.body,
                status: "failed",
                type: input.type,
                errorMessage: "Push device is disabled",
            } as IPushMessageBase;

            if (device.enabled) {
                try {
                    const firebaseResult = await FirebasePushServiceFactory.instance.send({
                        token: device.token,
                        title: input.title,
                        body: input.body,
                        type: input.type,
                    });

                    payload.status = "sent";
                    payload.providerMessageId = firebaseResult.providerMessageId;
                    payload.errorMessage = undefined;
                    payload.sentAt = sentAt;
                } catch (e: any) {
                    payload.errorMessage = e?.message ?? "Firebase push send failed";
                }
            }

            return reply.send(await this.service.create(payload));
        } catch (e: any) {
            if (e?.name === "ZodError") {
                return reply.status(400).send({
                    message: e?.message || "Push message validation error",
                });
            }

            this.handleError(e, reply);
        }
    }

    private getId(value: any): string {
        return String(value?._id ?? value?.id ?? value);
    }

}

export default PushMessageController;
export {
    PushMessageController
}
