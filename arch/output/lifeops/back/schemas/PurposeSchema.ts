
import { z } from 'zod';


const PurposeBaseSchema = z.object({
      title: z.string().min(1,'validation.required'),
    statement: z.string().min(1,'validation.required'),
    isPrimary: z.boolean().optional(),
    active: z.boolean().optional()
});

const PurposeSchema = PurposeBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default PurposeSchema;
export {PurposeSchema, PurposeBaseSchema}
