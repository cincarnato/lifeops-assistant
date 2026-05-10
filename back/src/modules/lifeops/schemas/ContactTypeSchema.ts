
import { z } from 'zod';


const ContactTypeBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional()
});

const ContactTypeSchema = ContactTypeBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default ContactTypeSchema;
export {ContactTypeSchema, ContactTypeBaseSchema}
