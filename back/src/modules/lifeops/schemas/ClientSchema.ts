import {z} from 'zod';


const ClientBaseSchema = z.object({
    name: z.string().min(1, 'validation.required'),
    legalName: z.string().optional().default(""),
    taxCondition: z.string().optional().default(""),
    taxIdType: z.string().optional().default(""),
    taxIdNumber: z.string().optional().default(""),
    taxAddress: z.string().optional().default(""),
    taxEmail: z.string().optional().default(""),
    description: z.string().optional().default(""),
    type: z.string().optional().default(""),
    status: z.enum(['active', 'inactive', 'prospect', 'paused', 'archived']).optional().default('active'),
    priority: z.string().optional().default(""),
    valueScore: z.number().nullable().optional().default(5),
    relationshipScore: z.number().nullable().optional().default(null),
    priorityScore: z.number().nullable().optional().default(null),
    website: z.string().optional().default(""),
    aliases: z.array(z.string()).optional().default([]),
    emailDomains: z.array(z.string()).optional().default([]),
    company: z.coerce.string().optional().nullable(),
    mainContact: z.coerce.string().optional().nullable(),
    redmineProjectIds: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    notes: z.string().optional().default(""),
    user: z.coerce.string().min(1, 'validation.required'),
    archivedAt: z.coerce.date().nullable().optional()
});

const ClientSchema = ClientBaseSchema
    .extend({
        _id: z.coerce.string(),
        company: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        mainContact: z.object({_id: z.coerce.string(), displayName: z.string()}).nullable().optional(),
        user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default ClientSchema;
export {ClientSchema, ClientBaseSchema}
