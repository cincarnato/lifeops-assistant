import { IEntitySchema } from "@drax/arch";

const processingStatusValues = [
    "PENDING",
    "PROCESSING",
    "PROCESSED",
    "IGNORED",
    "ERROR",
];

const entitySchema: IEntitySchema = {
    module: "meta",
    name: "WhatsAppWebhookEvent",
    apiBasePath: "whatsapp-webhook-events",
    apiTag: "WhatsAppWebhookEvent",
    collectionName: "whatsappWebhookEvents",
    schema: {
        tenantId: {
            type: "ref",
            ref: "Tenant",
            refDisplay: "name",
            index: true,
            header: true,
        },
        phoneNumberRef: {
            type: "ref",
            ref: "WhatsAppPhoneNumber",
            refDisplay: "displayPhoneNumber",
            index: true,
            header: true,
        },
        object: {
            type: "string",
            required: true,
            search: true,
            header: true,
        },
        field: {
            type: "string",
            required: true,
            search: true,
            index: true,
            header: true,
        },
        wabaId: {
            type: "string",
            search: true,
            index: true,
            header: true,
        },
        phoneNumberId: {
            type: "string",
            search: true,
            index: true,
            header: true,
        },
        receivedAt: {
            type: "date",
            required: true,
            index: true,
            header: true,
        },
        eventAt: {
            type: "date",
            index: true,
            header: true,
        },
        processingStatus: {
            type: "enum",
            enum: processingStatusValues,
            required: true,
            default: "PENDING",
            index: true,
            header: true,
        },
        processingAttempts: {
            type: "number",
            required: true,
            default: 0,
            header: true,
        },
        processedAt: {
            type: "date",
        },
        lastProcessingAttemptAt: {
            type: "date",
        },
        lastError: {
            type: "object",
            schema: {
                message: {
                    type: "string",
                },
                stack: {
                    type: "longString",
                },
                code: {
                    type: "string",
                },
            },
        },
        payload: {
            type: "object",
            required: true,
            schema: {},
        },
        deduplicationKey: {
            type: "string",
            search: true,
            index: true,
            header: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
