
import { z } from 'zod';


const MemoryBaseSchema = z.object({
      title: z.string().min(1,'validation.required'),
    content: z.string().min(1,'validation.required'),
    type: z.string().min(1,'validation.required'),
    lifeArea: z.coerce.string().optional().nullable().default(null),
    tags: z.array(z.string()).optional().default([]),
    priority: z.string().optional().default(''),
    source: z.string().optional().default('manual')
});

const MemorySchema = MemoryBaseSchema
    .extend({
      _id: z.coerce.string(),
        createdAt: z.coerce.date().nullable().optional(),
        updatedAt: z.coerce.date().nullable().optional(),
    })

export default MemorySchema;
export {MemorySchema, MemoryBaseSchema}
