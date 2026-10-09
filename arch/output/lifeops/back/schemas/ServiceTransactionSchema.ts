
import { z } from 'zod';


const ServiceTransactionBaseSchema = z.object({
      service: z.coerce.string().min(1,'validation.required'),
    period: z.string().min(1,'validation.required'),
    amount: z.number().min(0,'validation.required'),
    status: z.enum(['PENDING', 'PAID']).default('PENDING'),
    paidAt: z.coerce.date().nullable().optional()
});

const ServiceTransactionSchema = ServiceTransactionBaseSchema
    .extend({
      _id: z.coerce.string(),
       service: z.object({_id: z.coerce.string(), name: z.string()})
    })

export default ServiceTransactionSchema;
export {ServiceTransactionSchema, ServiceTransactionBaseSchema}
