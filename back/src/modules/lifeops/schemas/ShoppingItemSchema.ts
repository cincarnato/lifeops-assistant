
import { z } from 'zod';


const ShoppingItemBaseSchema = z.object({
    name: z.string().trim().min(1,'validation.required'),
    quantity: z.string().trim().nullable().optional(),
    purchaseLocation: z.string().trim().nullable().optional(),
    purchased: z.boolean().optional(),
    purchasedAt: z.coerce.date().nullable().optional(),
    user: z.coerce.string().min(1,'validation.required')
});

const ShoppingItemSchema = ShoppingItemBaseSchema
    .extend({
      _id: z.coerce.string(),
      quantity: z.string().nullable(),
      purchased: z.boolean(),
      purchasedAt: z.coerce.date().nullable(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      user: z.object({_id: z.coerce.string(), username: z.string()})
    })

const ShoppingItemPurgeResultSchema = z.object({ deletedCount: z.number().int().nonnegative() });

export { ShoppingItemPurgeResultSchema };
export default ShoppingItemSchema;
export {ShoppingItemSchema, ShoppingItemBaseSchema}
