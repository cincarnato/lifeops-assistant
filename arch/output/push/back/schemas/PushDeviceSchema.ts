
import { z } from 'zod';


const PushDeviceBaseSchema = z.object({
      user: z.coerce.string().min(1,'validation.required'),
    platform: z.enum(['android', 'ios', 'web']),
    token: z.string().min(1,'validation.required'),
    deviceName: z.string().optional(),
    enabled: z.boolean(),
    lastSeenAt: z.coerce.date().nullable().optional()
});

const PushDeviceSchema = PushDeviceBaseSchema
    .extend({
      _id: z.coerce.string(),
       user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default PushDeviceSchema;
export {PushDeviceSchema, PushDeviceBaseSchema}
