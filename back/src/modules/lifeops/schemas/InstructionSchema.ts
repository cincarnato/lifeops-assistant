
import { z } from 'zod';


const InstructionBaseSchema = z.object({
    tenant: z.string().nullable().optional(),
      title: z.string().min(1,'validation.required'),
    content: z.string().min(1,'validation.required')
});

const InstructionSchema = InstructionBaseSchema
    .extend({
      _id: z.coerce.string(),
        tenant: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),

    })

export default InstructionSchema;
export {InstructionSchema, InstructionBaseSchema}
