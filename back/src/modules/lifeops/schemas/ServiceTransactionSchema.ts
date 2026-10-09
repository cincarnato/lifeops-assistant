import { z } from 'zod';
import { ServiceSchema } from './ServiceSchema.js';

const ServicePeriodSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid period; expected YYYY-MM');
const ServiceTransactionUpdateSchema = z.object({
    service: z.string().min(1, 'validation.required'),
    period: ServicePeriodSchema,
    amount: z.number().nonnegative(),
    status: z.enum(['PENDING', 'PAID'])
}).strict();
const ServiceTransactionBaseSchema = ServiceTransactionUpdateSchema.extend({
    amount: z.number().nonnegative().optional(),
    status: z.enum(['PENDING', 'PAID']).default('PENDING')
});
const ServiceTransactionPatchSchema = ServiceTransactionUpdateSchema.partial();
const ServiceTransactionSchema = ServiceTransactionUpdateSchema.extend({
    _id: z.coerce.string(),
    service: ServiceSchema,
    paidAt: z.coerce.date().nullable().default(null)
}).strip();
const ServicePeriodParamsSchema = z.object({ period: ServicePeriodSchema });
const ServiceMonthlySchema = z.object({
    expectedIncome: z.number(), collectedIncome: z.number(), pendingIncome: z.number(),
    expectedExpenses: z.number(), paidExpenses: z.number(), pendingExpenses: z.number(),
    transactions: z.array(ServiceTransactionSchema)
});

export default ServiceTransactionSchema;
export { ServiceTransactionSchema, ServiceTransactionBaseSchema, ServiceTransactionUpdateSchema,
    ServiceTransactionPatchSchema, ServicePeriodSchema, ServicePeriodParamsSchema, ServiceMonthlySchema };
