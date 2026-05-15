
import { z } from 'zod';


const SourceBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional()
});

const SourceSchema = SourceBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default SourceSchema;
export {SourceSchema, SourceBaseSchema}
