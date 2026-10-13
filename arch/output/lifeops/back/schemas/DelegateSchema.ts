import { z } from 'zod';


const DelegateBaseSchema = z.object({
      contact: z.coerce.string().min(1,'validation.required'),
    skills: z.array(z.string()).optional(),
    description: z.string().optional(),
    active: z.boolean().optional(),
    user: z.coerce.string().min(1,'validation.required')
});

const DelegateSchema = DelegateBaseSchema
    .extend({
      _id: z.coerce.string(),
       contact: z.object({_id: z.coerce.string(), displayName: z.string()}),
user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default DelegateSchema;
export {DelegateSchema, DelegateBaseSchema}
