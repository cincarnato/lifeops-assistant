
import { z } from 'zod';


const MemoryTypeBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().min(1,'validation.required')
});

const MemoryTypeSchema = MemoryTypeBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default MemoryTypeSchema;
export {MemoryTypeSchema, MemoryTypeBaseSchema}
