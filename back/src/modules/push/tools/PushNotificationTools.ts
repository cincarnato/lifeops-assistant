import type {IPromptTool} from "@drax/ai-back/types/interfaces/IAIProvider.js";
import type {IDraxFieldFilter} from "@drax/crud-share";
import PushDeviceServiceFactory from "../factory/services/PushDeviceServiceFactory.js";
import PushMessageServiceFactory from "../factory/services/PushMessageServiceFactory.js";
import FirebasePushServiceFactory from "../factory/services/FirebasePushServiceFactory.js";
import type {IPushDevice} from "../interfaces/IPushDevice.js";
import type {IPushMessageBase} from "../interfaces/IPushMessage.js";

interface PushNotificationToolsContext {
    userId: string;
}

interface PushNotificationTargetResult {
    pushDeviceId: string;
    platform?: string;
    deviceName?: string;
    status: "sent" | "failed";
    pushMessageId?: string;
    providerMessageId?: string;
    errorMessage?: string;
}

class PushNotificationTools {
    static build(context: PushNotificationToolsContext): IPromptTool[] {
        return [
            this.sendPushNotificationTool(context),
        ];
    }

    private static sendPushNotificationTool(context: PushNotificationToolsContext): IPromptTool {
        return {
            name: "send_push_notification",
            description: "Envia una push notification al usuario autenticado. Si no se indica pushDeviceId, la envia a todos sus dispositivos push habilitados.",
            parameters: {
                type: "object",
                properties: {
                    pushDeviceId: {
                        type: "string",
                        description: "ID opcional de un dispositivo push especifico del usuario autenticado.",
                    },
                    title: {
                        type: "string",
                        description: "Titulo breve de la notificacion.",
                    },
                    body: {
                        type: "string",
                        description: "Contenido principal de la notificacion.",
                    },
                    type: {
                        type: "string",
                        default: "agent",
                        description: "Tipo interno de la notificacion. Usar agent si no hay un tipo mas especifico.",
                    },
                },
                required: ["title", "body"],
                additionalProperties: false,
            },
            execute: async (args: any) => {
                const title = String(args.title ?? "").trim();
                const body = String(args.body ?? "").trim();
                const type = String(args.type ?? "agent").trim() || "agent";

                if (!title || !body) {
                    return {
                        sent: false,
                        reason: "title_and_body_required",
                    };
                }

                const devices = args.pushDeviceId
                    ? await this.findUserDeviceById(args.pushDeviceId, context.userId)
                    : await this.findEnabledUserDevices(context.userId);

                if (devices.length === 0) {
                    return {
                        sent: false,
                        reason: args.pushDeviceId ? "push_device_not_found" : "no_enabled_push_devices",
                        results: [],
                    };
                }

                const results = await Promise.all(
                    devices.map(device => this.sendToDevice({
                        device,
                        userId: context.userId,
                        title,
                        body,
                        type,
                    }))
                );

                return {
                    sent: results.some(result => result.status === "sent"),
                    sentCount: results.filter(result => result.status === "sent").length,
                    failedCount: results.filter(result => result.status === "failed").length,
                    results,
                };
            },
        };
    }

    private static async findUserDeviceById(pushDeviceId: string, userId: string): Promise<IPushDevice[]> {
        const device = await PushDeviceServiceFactory.instance.findById(pushDeviceId);
        if (!device || this.getId(device.user) !== userId) {
            return [];
        }

        return [device];
    }

    private static async findEnabledUserDevices(userId: string): Promise<IPushDevice[]> {
        const filters: IDraxFieldFilter[] = [
            {field: "user", operator: "eq", value: userId},
            {field: "enabled", operator: "eq", value: true},
        ];

        return await PushDeviceServiceFactory.instance.find({
            limit: 20,
            filters,
        });
    }

    private static async sendToDevice(input: {
        device: IPushDevice;
        userId: string;
        title: string;
        body: string;
        type: string;
    }): Promise<PushNotificationTargetResult> {
        const sentAt = new Date();
        const payload = {
            user: input.userId,
            title: input.title,
            body: input.body,
            status: "failed",
            type: input.type,
            errorMessage: input.device.enabled ? undefined : "Push device is disabled",
        } as IPushMessageBase;

        if (input.device.enabled) {
            try {
                const firebaseResult = await FirebasePushServiceFactory.instance.send({
                    token: input.device.token,
                    title: input.title,
                    body: input.body,
                    type: input.type,
                });

                payload.status = "sent";
                payload.providerMessageId = firebaseResult.providerMessageId;
                payload.sentAt = sentAt;
            } catch (e: any) {
                payload.errorMessage = e?.message ?? "Firebase push send failed";
            }
        }

        const message = await PushMessageServiceFactory.instance.create(payload);

        return {
            pushDeviceId: this.getId(input.device),
            platform: input.device.platform,
            deviceName: input.device.deviceName,
            status: payload.status === "sent" ? "sent" : "failed",
            pushMessageId: this.getId(message),
            providerMessageId: payload.providerMessageId,
            errorMessage: payload.errorMessage,
        };
    }

    private static getId(value: any): string {
        return String(value?._id ?? value?.id ?? value);
    }
}

export default PushNotificationTools;
export {PushNotificationTools};
export type {PushNotificationToolsContext};
