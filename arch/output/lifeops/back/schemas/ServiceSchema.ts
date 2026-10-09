
import { z } from 'zod';


const ServiceBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    businessPartner: z.coerce.string().min(1,'validation.required'),
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number().min(0,'validation.required'),
    frequency: z.enum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'YEARLY', 'ON_DEMAND']),
    active: z.boolean()
});

const ServiceSchema = ServiceBaseSchema
    .extend({
      _id: z.coerce.string(),
       businessPartner: z.object({_id: z.coerce.string(), name: z.string()})
    })

export default ServiceSchema;
export {ServiceSchema, ServiceBaseSchema}
