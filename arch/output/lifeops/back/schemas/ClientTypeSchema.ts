
import { z } from 'zod';


const ClientTypeBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional()
});

const ClientTypeSchema = ClientTypeBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default ClientTypeSchema;
export {ClientTypeSchema, ClientTypeBaseSchema}
