
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
    link: z.string().optional(),
});

const PushMessageBrowserSchema = z.object({
    targetUserId: z.string().min(1, "validation.required"),
    title: z.string().optional(),
    body: z.string().min(1, "validation.required"),
    type: z.string().optional().default("web"),
    link: z.string().optional(),
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

            const user = this.getOptionalId(device.user);
            let message = await this.service.create({
                user,
                title: input.title,
                body: input.body,
                status: "failed",
                type: input.type,
                link: input.link,
                errorMessage: "Push device is disabled",
            } as IPushMessageBase);

            const messageId = this.getId(message);
            const link = this.resolvePushLink(input.link, messageId, request);
            message = await this.service.updatePartial(messageId, {link} as IPushMessageBase);

            if (device.enabled) {
                try {
                    const firebaseResult = await FirebasePushServiceFactory.instance.send({
                        token: device.token,
                        title: input.title,
                        body: input.body,
                        type: input.type,
                        link,
                    });

                    message = await this.service.updatePartial(messageId, {
                        status: "sent",
                        providerMessageId: firebaseResult.providerMessageId,
                        errorMessage: undefined,
                        sentAt: new Date(),
                    } as IPushMessageBase);
                } catch (e: any) {
                    message = await this.service.updatePartial(messageId, {
                        status: "failed",
                        errorMessage: e?.message ?? "Firebase push send failed",
                    } as IPushMessageBase);
                }
            }

            return reply.send(message);
        } catch (e: any) {
            if (e?.name === "ZodError") {
                return reply.status(400).send({
                    message: e?.message || "Push message validation error",
                });
            }

            this.handleError(e, reply);
        }
    }

    async sendBrowser(request: CustomRequest, reply: FastifyReply) {
        try {
            request.rbac.assertPermission(PushMessagePermissions.Create);

            const input = PushMessageBrowserSchema.parse(request.body ?? {});
            return reply.send(await PushMessageServiceFactory.instance.sendBrowserNotification(input));
        } catch (e: any) {
            if (e?.name === "ZodError") {
                return reply.status(400).send({
                    message: e?.message || "Browser push message validation error",
                });
            }

            this.handleError(e, reply);
        }
    }

    async publicFindById(request: CustomRequest, reply: FastifyReply) {
        try {
            const params = z.object({
                id: z.string().min(1, "validation.required"),
            }).parse(request.params ?? {});
            const message = await this.service.findById(params.id);
            if (!message) {
                throw new NotFoundError();
            }

            return reply.send({
                _id: this.getId(message),
                title: message.title,
                body: message.body,
                status: message.status,
                link: message.link,
            });
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

    private getOptionalId(value: any): string | null {
        const id = value?._id ?? value?.id ?? value;
        return id ? String(id) : null;
    }

    private resolvePushLink(link: string | undefined, messageId: string, request: CustomRequest): string {
        const fallback = `${this.getRequestOrigin(request)}/push/{idpush}`;
        return (link?.trim() || fallback).split("{idpush}").join(messageId);
    }

    private getRequestOrigin(request: CustomRequest): string {
        const protocol = (request.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] || request.protocol || "http";
        const host = request.headers["x-forwarded-host"] || request.headers.host;
        return `${protocol}://${host}`;
    }

}

export default PushMessageController;
export {
    PushMessageController
}
