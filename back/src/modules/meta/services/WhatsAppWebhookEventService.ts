
import type{IWhatsAppWebhookEventRepository} from "../interfaces/IWhatsAppWebhookEventRepository";
import type {IWhatsAppWebhookEventBase, IWhatsAppWebhookEvent} from "../interfaces/IWhatsAppWebhookEvent";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import {z} from "zod";
import {createHash} from "node:crypto";
import WhatsAppPhoneNumberServiceFactory from "../factory/services/WhatsAppPhoneNumberServiceFactory.js";
import {WhatsAppWebhookPayloadSchema} from "../schemas/WhatsAppWebhookEventSchema.js";

const MetaWebhookBodySchema = z.object({
    object: z.string().min(1, "validation.required"),
    entry: z.array(
        z.object({
            id: z.string().min(1, "validation.required"),
            changes: z.array(
                z.object({
                    field: z.string().min(1, "validation.required"),
                    value: WhatsAppWebhookPayloadSchema,
                }).passthrough()
            ).optional(),
        }).passthrough()
    ).optional(),
}).passthrough();

type MetaWebhookBody = z.infer<typeof MetaWebhookBodySchema>;

interface RegisterWhatsAppWebhookResult {
    received: number;
    inserted: number;
    duplicated: number;
}

class WhatsAppWebhookEventService extends AbstractService<IWhatsAppWebhookEvent, IWhatsAppWebhookEventBase, IWhatsAppWebhookEventBase> {

    private readonly WhatsAppWebhookEventRepository: IWhatsAppWebhookEventRepository;

    constructor(WhatsAppWebhookEventRepository: IWhatsAppWebhookEventRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(WhatsAppWebhookEventRepository, baseSchema, fullSchema);
        this.WhatsAppWebhookEventRepository = WhatsAppWebhookEventRepository;
        
        this._validateOutput = true
        
    }

    async registerWhatsAppWebhook(body: unknown): Promise<RegisterWhatsAppWebhookResult> {
        const parsedBody = MetaWebhookBodySchema.parse(body);
        const receivedAt = new Date();
        const events = await this.buildEvents(parsedBody, receivedAt);

        if (events.length === 0) {
            return {
                received: 0,
                inserted: 0,
                duplicated: 0,
            };
        }

        try {
            const inserted = await this.WhatsAppWebhookEventRepository.insertMany(events, {ordered: false});
            return {
                received: events.length,
                inserted: inserted.length,
                duplicated: events.length - inserted.length,
            };
        } catch (error: any) {
            if (!this.isDuplicateBulkWriteError(error)) {
                throw error;
            }

            const insertedCount = this.getInsertedCountFromBulkWriteError(error);
            return {
                received: events.length,
                inserted: insertedCount,
                duplicated: events.length - insertedCount,
            };
        }
    }

    private async buildEvents(body: MetaWebhookBody, receivedAt: Date): Promise<IWhatsAppWebhookEventBase[]> {
        const events: IWhatsAppWebhookEventBase[] = [];
        const phoneNumberCache = new Map<string, {tenantId?: any; phoneNumberRef?: any}>();

        for (const entry of body.entry ?? []) {
            for (const change of entry.changes ?? []) {
                const phoneNumberId = this.extractPhoneNumberId(change.value);
                const phoneNumberData = phoneNumberId
                    ? await this.resolvePhoneNumber(phoneNumberId, phoneNumberCache)
                    : {};

                events.push({
                    ...phoneNumberData,
                    object: body.object,
                    field: change.field,
                    wabaId: entry.id,
                    phoneNumberId,
                    receivedAt,
                    eventAt: this.extractEventDate(change.field, change.value),
                    processingStatus: "PENDING",
                    processingAttempts: 0,
                    deduplicationKey: this.buildDeduplicationKey(change.field, change.value),
                    payload: change.value,
                });
            }
        }

        return events;
    }

    private async resolvePhoneNumber(phoneNumberId: string, cache: Map<string, {tenantId?: any; phoneNumberRef?: any}>): Promise<{tenantId?: any; phoneNumberRef?: any}> {
        const cached = cache.get(phoneNumberId);

        if (cached) {
            return cached;
        }

        const [phoneNumber] = await WhatsAppPhoneNumberServiceFactory.instance.findBy("phoneNumberId", phoneNumberId, 1);
        const resolved = phoneNumber
            ? {
                tenantId: this.extractId(phoneNumber.tenantId),
                phoneNumberRef: this.extractId(phoneNumber),
            }
            : {};

        cache.set(phoneNumberId, resolved);
        return resolved;
    }

    private extractId(value: any): any {
        return value?._id ?? value?.id ?? value;
    }

    private extractPhoneNumberId(payload: Record<string, unknown>): string | undefined {
        const metadata = payload.metadata as {phone_number_id?: string} | undefined;
        return metadata?.phone_number_id;
    }

    private extractEventDate(field: string, payload: Record<string, unknown>): Date | undefined {
        if (field !== "messages") {
            return undefined;
        }

        const value = payload as {
            messages?: Array<{timestamp?: string}>;
            statuses?: Array<{timestamp?: string}>;
        };

        const timestamp =
            value.messages?.[0]?.timestamp ??
            value.statuses?.[0]?.timestamp;

        return this.unixTimestampToDate(timestamp);
    }

    private unixTimestampToDate(timestamp?: string): Date | undefined {
        if (!timestamp) {
            return undefined;
        }

        const seconds = Number(timestamp);

        if (!Number.isFinite(seconds)) {
            return undefined;
        }

        return new Date(seconds * 1000);
    }

    private buildDeduplicationKey(field: string, payload: Record<string, unknown>): string {
        const value = payload as {
            messages?: Array<{id?: string}>;
            statuses?: Array<{id?: string; status?: string; timestamp?: string}>;
        };

        const message = value.messages?.[0];

        if (message?.id) {
            return `message:${message.id}`;
        }

        const status = value.statuses?.[0];

        if (status?.id && status.status) {
            return [
                "status",
                status.id,
                status.status,
                status.timestamp ?? "unknown",
            ].join(":");
        }

        return [
            field,
            this.createPayloadHash(payload),
        ].join(":");
    }

    private createPayloadHash(value: unknown): string {
        return createHash("sha256")
            .update(this.stableStringify(value))
            .digest("hex");
    }

    private stableStringify(value: unknown): string {
        if (Array.isArray(value)) {
            return `[${value.map(item => this.stableStringify(item)).join(",")}]`;
        }

        if (value && typeof value === "object") {
            const objectValue = value as Record<string, unknown>;
            return `{${Object.keys(objectValue).sort().map(key => `${JSON.stringify(key)}:${this.stableStringify(objectValue[key])}`).join(",")}}`;
        }

        return JSON.stringify(value);
    }

    private isDuplicateBulkWriteError(error: any): boolean {
        if (error?.code === 11000) {
            return true;
        }

        const writeErrors = error?.writeErrors ?? error?.result?.result?.writeErrors;

        return Array.isArray(writeErrors) && writeErrors.length > 0 && writeErrors.every((writeError: any) => writeError?.code === 11000);
    }

    private getInsertedCountFromBulkWriteError(error: any): number {
        if (Array.isArray(error?.insertedDocs)) {
            return error.insertedDocs.length;
        }

        return error?.result?.insertedCount ?? error?.result?.result?.nInserted ?? 0;
    }

}

export default WhatsAppWebhookEventService
export {
    WhatsAppWebhookEventService,
    MetaWebhookBodySchema,
}
