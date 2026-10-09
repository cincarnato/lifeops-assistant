import { z } from 'zod';

const ServiceUpdateSchema = z.object({
    name: z.string().trim().min(1, 'validation.required'),
    businessPartner: z.string().min(1, 'validation.required'),
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number().nonnegative(),
    frequency: z.enum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'YEARLY', 'ON_DEMAND']),
    active: z.boolean()
}).strict();
const ServiceBaseSchema = ServiceUpdateSchema.extend({ active: z.boolean().default(true) });
const ServicePatchSchema = ServiceUpdateSchema.partial();
const ServiceSchema = ServiceUpdateSchema.extend({
    _id: z.coerce.string(),
    businessPartner: z.object({ _id: z.coerce.string(), name: z.string() })
}).strip();

export default ServiceSchema;
export { ServiceSchema, ServiceBaseSchema, ServiceUpdateSchema, ServicePatchSchema };
