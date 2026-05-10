
import { z } from 'zod';


const CompanyTypeBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional()
});

const CompanyTypeSchema = CompanyTypeBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default CompanyTypeSchema;
export {CompanyTypeSchema, CompanyTypeBaseSchema}
