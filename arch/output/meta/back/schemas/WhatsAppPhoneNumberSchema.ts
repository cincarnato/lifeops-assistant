
import { z } from 'zod';


const WhatsAppPhoneNumberBaseSchema = z.object({
      tenantId: z.coerce.string().min(1,'validation.required'),
    phoneNumberId: z.string().min(1,'validation.required'),
    wabaId: z.string().min(1,'validation.required'),
    displayPhoneNumber: z.string().min(1,'validation.required'),
    enabled: z.boolean()
});

const WhatsAppPhoneNumberSchema = WhatsAppPhoneNumberBaseSchema
    .extend({
      _id: z.coerce.string(),
       tenantId: z.object({_id: z.coerce.string(), name: z.string()})
    })

export default WhatsAppPhoneNumberSchema;
export {WhatsAppPhoneNumberSchema, WhatsAppPhoneNumberBaseSchema}
