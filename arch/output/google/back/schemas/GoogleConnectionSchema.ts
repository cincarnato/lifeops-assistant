
import { z } from 'zod';


const GoogleConnectionBaseSchema = z.object({
      userId: z.coerce.string().min(1,'validation.required'),
    provider: z.enum(['google']).default('google'),
    googleEmail: z.string().min(1,'validation.required'),
    googleUserId: z.string().min(1,'validation.required'),
    accessToken: z.string().optional(),
    refreshToken: z.string().min(1,'validation.required'),
    scope: z.array(z.string()),
    expiryDate: z.coerce.date({error: "validation.date"}),
    status: z.enum(['active', 'revoked', 'error']).default('active'),
    lastUsedAt: z.coerce.date().nullable().optional(),
    connectedAt: z.coerce.date({error: "validation.date"})
});

const GoogleConnectionSchema = GoogleConnectionBaseSchema
    .extend({
      _id: z.coerce.string(),
       userId: z.object({_id: z.coerce.string(), email: z.string()})
    })

export default GoogleConnectionSchema;
export {GoogleConnectionSchema, GoogleConnectionBaseSchema}
