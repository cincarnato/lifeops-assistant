
import { z } from 'zod';


const InstructionBaseSchema = z.object({
      title: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    content: z.string().min(1,'validation.required')
});

const InstructionSchema = InstructionBaseSchema
    .extend({
      _id: z.coerce.string(),

    })

export default InstructionSchema;
export {InstructionSchema, InstructionBaseSchema}
