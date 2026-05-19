
import { z } from 'zod';

const capitalizeFirstLetter = (value: string) => {
    if (!value) return value;
    return value.charAt(0).toLocaleUpperCase('es') + value.slice(1);
};

const ContactBaseSchema = z.object({
      firstName: z.string().min(1,'validation.required').transform(capitalizeFirstLetter),
    lastName: z.string().optional().default("").transform(capitalizeFirstLetter),
    displayName: z.string().min(1,'validation.required').transform(capitalizeFirstLetter),
    type: z.string().optional().default(""),
    priority: z.string().optional().default(""),
    client: z.coerce.string().optional().nullable(),
    company: z.coerce.string().optional().nullable(),
    jobTitle: z.string().optional().default(""),
    department: z.string().optional().default(""),
    emails: z.array(z.string()).optional().default([]),
    phones: z.array(z.string()).optional().default([]),
    valueScore: z.number().nullable().optional().default(null),
    relationshipScore: z.number().nullable().optional().default(null),
    tags: z.array(z.string()).optional().default([]),
    notes: z.string().optional().default(""),
    user: z.coerce.string().min(1,'validation.required'),
    archivedAt: z.coerce.date().nullable().optional()
});

const ContactSchema = ContactBaseSchema
    .extend({
      _id: z.coerce.string(),
       client: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
company: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default ContactSchema;
export {ContactSchema, ContactBaseSchema}
