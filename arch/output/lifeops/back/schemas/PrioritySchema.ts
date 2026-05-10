
import { z } from 'zod';


const PriorityBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    color: z.string().min(1,'validation.required')
});

const PrioritySchema = PriorityBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default PrioritySchema;
export {PrioritySchema, PriorityBaseSchema}
