
import { z } from 'zod';


const HabitBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    lifeArea: z.string().optional(),
    active: z.boolean().optional(),
    frequency: z.object({    type: z.enum(['daily', 'weekly', 'monthly'])}),
    generateTask: z.boolean().optional(),
    taskTemplate: z.object({    title: z.string().optional(),
    description: z.string().optional(),
    estimatedMinutes: z.number().nullable().optional(),
    priority: z.string().optional()})
});

const HabitSchema = HabitBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default HabitSchema;
export {HabitSchema, HabitBaseSchema}
