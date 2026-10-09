import {z} from 'zod';


const BusinessPartnerBaseSchema = z.object({
    name: z.string().min(1, 'validation.required'),
    legalName: z.string().optional().default(""),
    taxCondition: z.string().optional().default(""),
    taxIdType: z.string().optional().default(""),
    taxIdNumber: z.string().optional().default(""),
    taxAddress: z.string().optional().default(""),
    taxEmail: z.string().optional().default(""),
    description: z.string().optional().default(""),
    roles: z.array(z.enum(['client', 'provider'])).default([]),
    priority: z.string().optional().default(""),
    website: z.string().optional().default(""),
    aliases: z.array(z.string()).optional().default([]),
    mainContact: z.coerce.string().optional().nullable(),
    redmineProjectIds: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    notes: z.string().optional().default(""),
    user: z.coerce.string().min(1, 'validation.required'),
    archivedAt: z.coerce.date().nullable().optional()
});

const BusinessPartnerSchema = BusinessPartnerBaseSchema
    .extend({
        _id: z.coerce.string(),
        mainContact: z.object({_id: z.coerce.string(), displayName: z.string()}).nullable().optional(),
        user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default BusinessPartnerSchema;
export {BusinessPartnerSchema, BusinessPartnerBaseSchema}
