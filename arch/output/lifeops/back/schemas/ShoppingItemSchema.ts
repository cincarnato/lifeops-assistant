
import { z } from 'zod';


const ShoppingItemBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    quantity: z.string().optional(),
    purchased: z.boolean().optional(),
    purchasedAt: z.coerce.date().nullable().optional(),
    user: z.coerce.string().min(1,'validation.required')
});

const ShoppingItemSchema = ShoppingItemBaseSchema
    .extend({
      _id: z.coerce.string(),
       user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default ShoppingItemSchema;
export {ShoppingItemSchema, ShoppingItemBaseSchema}
