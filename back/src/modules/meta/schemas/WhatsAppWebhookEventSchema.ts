import {z} from 'zod';

const WhatsAppWebhookPayloadSchema = z.object({}).catchall(z.unknown());

const WhatsAppWebhookEventBaseSchema = z.object({
    tenantId: z.coerce.string().optional().nullable(),
    phoneNumberRef: z.coerce.string().optional().nullable(),
    object: z.string().min(1, 'validation.required'),
    field: z.string().min(1, 'validation.required'),
    wabaId: z.string().optional(),
    phoneNumberId: z.string().optional(),
    receivedAt: z.coerce.date({error: "validation.date"}),
    eventAt: z.coerce.date().nullable().optional(),
    processingStatus: z.enum(['PENDING', 'PROCESSING', 'PROCESSED', 'IGNORED', 'ERROR']).default('PENDING'),
    processingAttempts: z.number().min(0, 'validation.required').default(0),
    processedAt: z.coerce.date().nullable().optional(),
    lastProcessingAttemptAt: z.coerce.date().nullable().optional(),
    lastError: z.object({
        message: z.string().optional(),
        stack: z.string().optional(),
        code: z.string().optional()
    }).optional(),
    payload: WhatsAppWebhookPayloadSchema,
    deduplicationKey: z.string().optional()
});

const WhatsAppWebhookEventSchema = WhatsAppWebhookEventBaseSchema
    .extend({
        _id: z.coerce.string(),
        tenantId: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        phoneNumberRef: z.object({_id: z.coerce.string(), displayPhoneNumber: z.string()}).nullable().optional()
    })

export default WhatsAppWebhookEventSchema;
export {WhatsAppWebhookEventSchema, WhatsAppWebhookEventBaseSchema, WhatsAppWebhookPayloadSchema}
