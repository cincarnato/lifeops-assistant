
import { z } from 'zod';


const ContactBaseSchema = z.object({
      firstName: z.string().min(1,'validation.required'),
    lastName: z.string().optional(),
    displayName: z.string().min(1,'validation.required'),
    type: z.enum(['work', 'client', 'provider', 'partner', 'personal', 'internal']).optional().default('work'),
    status: z.enum(['active', 'inactive', 'archived']).optional().default('active'),
    priority: z.string().optional(),
    client: z.coerce.string().optional().nullable(),
    company: z.coerce.string().min(1,'validation.required'),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    emails: z.array(z.string()).optional().default([]),
    phones: z.array(z.string()).optional().default([]),
    valueScore: z.number().nullable().optional(),
    relationshipScore: z.number().nullable().optional(),
    tags: z.array(z.string()).optional().default([]),
    notes: z.string().optional(),
    user: z.coerce.string().min(1,'validation.required'),
    archivedAt: z.coerce.date().nullable().optional()
});

const ContactSchema = ContactBaseSchema
    .extend({
      _id: z.coerce.string(),
       client: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
company: z.object({_id: z.coerce.string(), name: z.string()}),
user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default ContactSchema;
export {ContactSchema, ContactBaseSchema}
