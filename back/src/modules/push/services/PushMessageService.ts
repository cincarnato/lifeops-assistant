
import type{IPushMessageRepository} from "../interfaces/IPushMessageRepository";
import type {IPushMessageBase, IPushMessage} from "../interfaces/IPushMessage";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import type {IDraxFieldFilter} from "@drax/crud-share";
import PushDeviceServiceFactory from "../factory/services/PushDeviceServiceFactory.js";
import FirebasePushServiceFactory from "../factory/services/FirebasePushServiceFactory.js";

interface ISendBrowserNotificationInput {
    targetUserId: string;
    title?: string;
    body: string;
    type?: string;
}

interface ISendBrowserNotificationTargetResult {
    pushDeviceId: string;
    status: "sent" | "failed";
    pushMessageId?: string;
    providerMessageId?: string;
    errorMessage?: string;
}

interface ISendBrowserNotificationResult {
    sent: boolean;
    sentCount: number;
    failedCount: number;
    results: ISendBrowserNotificationTargetResult[];
}

class PushMessageService extends AbstractService<IPushMessage, IPushMessageBase, IPushMessageBase> {


    constructor(PushMessageRepository: IPushMessageRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(PushMessageRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

    async sendBrowserNotification(input: ISendBrowserNotificationInput): Promise<ISendBrowserNotificationResult> {
        const title = input.title?.trim() || "LifeOps";
        const body = input.body.trim();
        const type = input.type?.trim() || "web";

        if (!input.targetUserId?.trim() || !body) {
            return {
                sent: false,
                sentCount: 0,
                failedCount: 0,
                results: [],
            };
        }

        const filters: IDraxFieldFilter[] = [
            {field: "user", operator: "eq", value: input.targetUserId},
            {field: "platform", operator: "eq", value: "web"},
            {field: "enabled", operator: "eq", value: true},
        ];

        const devices = await PushDeviceServiceFactory.instance.find({
            limit: 20,
            filters,
        });

        const results = await Promise.all(devices.map(async device => {
            const payload = {
                user: input.targetUserId,
                title,
                body,
                status: "failed",
                type,
            } as IPushMessageBase;

            try {
                const firebaseResult = await FirebasePushServiceFactory.instance.send({
                    token: device.token,
                    title,
                    body,
                    type,
                });

                payload.status = "sent";
                payload.providerMessageId = firebaseResult.providerMessageId;
                payload.sentAt = new Date();
            } catch (e: any) {
                payload.errorMessage = e?.message ?? "Firebase browser push send failed";
            }

            const message = await this.create(payload);

            return {
                pushDeviceId: this.getId(device),
                status: payload.status === "sent" ? "sent" : "failed",
                pushMessageId: this.getId(message),
                providerMessageId: payload.providerMessageId,
                errorMessage: payload.errorMessage,
            } as ISendBrowserNotificationTargetResult;
        }));

        const sentCount = results.filter(result => result.status === "sent").length;
        const failedCount = results.filter(result => result.status === "failed").length;

        return {
            sent: sentCount > 0,
            sentCount,
            failedCount,
            results,
        };
    }

    private getId(value: any): string {
        return String(value?._id ?? value?.id ?? value);
    }

}

export default PushMessageService
export {PushMessageService}
export type {
    ISendBrowserNotificationInput,
    ISendBrowserNotificationResult,
    ISendBrowserNotificationTargetResult,
}
