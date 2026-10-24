import {z} from 'zod';


const BusinessPartnerBaseSchema = z.object({
    tenant: z.string().nullable().optional(),
    name: z.string().min(1, 'validation.required'),
    legalName: z.string().optional().default(""),
    taxCondition: z.string().optional().default(""),
    taxIdType: z.string().optional().default(""),
    taxIdNumber: z.string().optional().default(""),
    taxAddress: z.string().optional().default(""),
    taxEmail: z.string().optional().default(""),
    bankCbu: z.string().optional(),
    bankAlias: z.string().optional(),
    bankAccount: z.string().optional(),
    bankName: z.string().optional(),
    paymentReceiptEmail: z.string().optional(),
    paymentReceiptUrl: z.string().optional(),
    description: z.string().optional().default(""),
    roles: z.array(z.enum(['client', 'provider'])).default([]),
    priority: z.string().optional().default(""),
    website: z.string().optional().default(""),
    aliases: z.array(z.string()).optional().default([]),
    mainContact: z.coerce.string().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
    notes: z.string().optional().default(""),
    user: z.coerce.string().min(1, 'validation.required'),
    archivedAt: z.coerce.date().nullable().optional()
});

const BusinessPartnerSchema = BusinessPartnerBaseSchema
    .extend({
        _id: z.coerce.string(),
        tenant: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        // Output-only defaults cover legacy lean documents without injecting values into PATCH inputs.
        bankCbu: BusinessPartnerBaseSchema.shape.bankCbu.default(''),
        bankAlias: BusinessPartnerBaseSchema.shape.bankAlias.default(''),
        bankAccount: BusinessPartnerBaseSchema.shape.bankAccount.default(''),
        bankName: BusinessPartnerBaseSchema.shape.bankName.default(''),
        paymentReceiptEmail: BusinessPartnerBaseSchema.shape.paymentReceiptEmail.default(''),
        paymentReceiptUrl: BusinessPartnerBaseSchema.shape.paymentReceiptUrl.default(''),
        mainContact: z.object({_id: z.coerce.string(), displayName: z.string()}).nullable().optional(),
        user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default BusinessPartnerSchema;
export {BusinessPartnerSchema, BusinessPartnerBaseSchema}
