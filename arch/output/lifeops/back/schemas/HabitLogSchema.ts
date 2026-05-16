
import { z } from 'zod';


const HabitLogBaseSchema = z.object({
      habit: z.coerce.string().min(1,'validation.required'),
    date: z.coerce.date({error: "validation.date"}),
    task: z.coerce.string().optional().nullable()
});

const HabitLogSchema = HabitLogBaseSchema
    .extend({
      _id: z.coerce.string(),
       habit: z.object({_id: z.coerce.string(), name: z.string()}),
task: z.object({_id: z.coerce.string(), title: z.string()}).nullable().optional()
    })

export default HabitLogSchema;
export {HabitLogSchema, HabitLogBaseSchema}
