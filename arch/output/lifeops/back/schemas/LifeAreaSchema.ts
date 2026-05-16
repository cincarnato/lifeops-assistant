
import { z } from 'zod';


const LifeAreaBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional()
});

const LifeAreaSchema = LifeAreaBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default LifeAreaSchema;
export {LifeAreaSchema, LifeAreaBaseSchema}
