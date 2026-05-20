import { z } from 'zod';

const ContactEmailSchema = z.object({
    value: z.string().min(1, 'validation.required'),
    type: z.string().optional().default("other"),
    primary: z.boolean().optional().default(false),
    displayName: z.string().optional().default(""),
});

const ContactPhoneSchema = z.object({
    value: z.string().min(1, 'validation.required'),
    normalizedValue: z.string().optional().default(""),
    type: z.string().optional().default("other"),
    primary: z.boolean().optional().default(false),
});

const ContactAddressSchema = z.object({
    formattedValue: z.string().optional().default(""),
    type: z.string().optional().default("other"),
    streetAddress: z.string().optional().default(""),
    city: z.string().optional().default(""),
    region: z.string().optional().default(""),
    postalCode: z.string().optional().default(""),
    country: z.string().optional().default(""),
    countryCode: z.string().optional().default(""),
    primary: z.boolean().optional().default(false),
});

const ContactOrganizationSchema = z.object({
    name: z.string().optional().default(""),
    title: z.string().optional().default(""),
    department: z.string().optional().default(""),
    domain: z.string().optional().default(""),
});

const ContactBirthdaySchema = z.object({
    year: z.number().nullable().optional(),
    month: z.number().nullable().optional(),
    day: z.number().nullable().optional(),
});

const ContactBaseSchema = z.object({
    source: z.enum(['manual', 'google', 'imported', 'api']).optional().default('manual'),
    externalProvider: z.enum(['google']).nullable().optional(),
    externalId: z.string().optional().default(""),
    externalEtag: z.string().optional().default(""),
    externalRaw: z.unknown().optional(),
    displayName: z.string().min(1, 'validation.required'),
    givenName: z.string().optional().default(""),
    familyName: z.string().optional().default(""),
    nickname: z.string().optional().default(""),
    emails: z.array(ContactEmailSchema).optional().default([]),
    phones: z.array(ContactPhoneSchema).optional().default([]),
    organization: ContactOrganizationSchema.optional().default({name: "", title: "", department: "", domain: ""}),
    addresses: z.array(ContactAddressSchema).optional().default([]),
    photoUrl: z.string().optional().default(""),
    birthday: ContactBirthdaySchema.optional(),
    notes: z.string().optional().default(""),
    tags: z.array(z.string()).optional().default([]),
    status: z.enum(['active', 'archived', 'deleted']).optional().default('active'),
    lastSyncedAt: z.coerce.date().nullable().optional(),
    user: z.coerce.string().min(1, 'validation.required'),
});

const ContactSchema = ContactBaseSchema
    .extend({
        _id: z.coerce.string(),
        user: z.object({_id: z.coerce.string(), username: z.string()}),
        createdAt: z.coerce.date().nullable().optional(),
        updatedAt: z.coerce.date().nullable().optional(),
    });

export default ContactSchema;
export {
    ContactAddressSchema,
    ContactBaseSchema,
    ContactBirthdaySchema,
    ContactEmailSchema,
    ContactOrganizationSchema,
    ContactPhoneSchema,
    ContactSchema,
}
