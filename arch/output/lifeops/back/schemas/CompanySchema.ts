
import { z } from 'zod';


const CompanyBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    legalName: z.string().optional(),
    taxIdType: z.string().optional(),
    taxIdNumber: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional().default('active'),
    website: z.string().optional(),
    emailDomains: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    notes: z.string().optional(),
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
