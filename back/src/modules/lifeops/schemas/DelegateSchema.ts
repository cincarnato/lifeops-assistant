import { z } from 'zod';


const DelegateBaseSchema = z.object({
    tenant: z.string().nullable().optional(),
      contact: z.coerce.string().regex(/^[a-f\d]{24}$/i, 'validation.invalid'),
    skills: z.array(z.string()).optional(),
    description: z.string().optional(),
    active: z.boolean().optional(),
    user: z.coerce.string().min(1,'validation.required')
});

const DelegateSchema = DelegateBaseSchema
    .extend({
      _id: z.coerce.string(),
        tenant: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
       contact: z.object({_id: z.coerce.string(), displayName: z.string()}),
user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default DelegateSchema;
export {DelegateSchema, DelegateBaseSchema}
