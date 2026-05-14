
import { z } from 'zod';


const MemoryBaseSchema = z.object({
      title: z.string().min(1,'validation.required'),
    content: z.string().min(1,'validation.required'),
    type: z.string().min(1,'validation.required'),
    tags: z.array(z.string()).optional().default([]),
    importance: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    source: z.enum(['manual', 'ai', 'conversation', 'email', 'calendar', 'task']).optional().default('manual')
});

const MemorySchema = MemoryBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default MemorySchema;
export {MemorySchema, MemoryBaseSchema}
