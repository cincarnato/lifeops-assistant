
import { z } from 'zod';


const BusinessPartnerBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    legalName: z.string().optional(),
    taxCondition: z.string().optional(),
    taxIdType: z.string().optional(),
    taxIdNumber: z.string().optional(),
    taxAddress: z.string().optional(),
    taxEmail: z.string().optional(),
    description: z.string().optional(),
    roles: z.array(z.enum(['client', 'provider'])).default([]),
    priority: z.string().optional(),
    website: z.string().optional(),
    aliases: z.array(z.string()).optional().default([]),
    mainContact: z.coerce.string().optional().nullable(),
    redmineProjectIds: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    notes: z.string().optional(),
    user: z.coerce.string().min(1,'validation.required'),
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
