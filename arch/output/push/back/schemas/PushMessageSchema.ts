
import { z } from 'zod';


const PushMessageBaseSchema = z.object({
      user: z.coerce.string().min(1,'validation.required'),
    title: z.string().min(1,'validation.required'),
    body: z.string().min(1,'validation.required'),
    status: z.enum(['pending', 'sent', 'failed', 'read']).default('pending'),
    providerMessageId: z.string().optional(),
    type: z.string().optional(),
    errorMessage: z.string().optional(),
    sentAt: z.coerce.date().nullable().optional()
});

const PushMessageSchema = PushMessageBaseSchema
    .extend({
      _id: z.coerce.string(),
       user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default PushMessageSchema;
export {PushMessageSchema, PushMessageBaseSchema}
