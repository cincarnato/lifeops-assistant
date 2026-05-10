
import { z } from 'zod';


const CompanyBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    legalName: z.string().optional().default(""),
    taxIdType: z.string().optional().default(""),
    taxIdNumber: z.string().optional().default(""),
    description: z.string().optional().default(""),
    type: z.enum(['company', 'government', 'non_profit', 'internal', 'partner', 'provider', 'other']).optional().default('company'),
    status: z.enum(['active', 'inactive', 'archived']).optional().default('active'),
    website: z.string().optional().default(""),
    emailDomains: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    notes: z.string().optional().default(""),
    user: z.coerce.string().min(1,'validation.required'),
    archivedAt: z.coerce.date().nullable().optional()
});

const CompanySchema = CompanyBaseSchema
    .extend({
      _id: z.coerce.string(),
       user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default CompanySchema;
export {CompanySchema, CompanyBaseSchema}
