
import { z } from 'zod';


const DayPlanBaseSchema = z.object({
      date: z.coerce.date({error: "validation.date"}),
    status: z.enum(['BORRADOR', 'VISTO', 'CONFIRMADO', 'CERRADO']).default('BORRADOR'),
    events: z.array(
z.object({    googleEventId: z.string().min(1,'validation.required'),
    title: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    startAt: z.coerce.date({error: "validation.date"}),
    endAt: z.coerce.date().nullable().optional(),
    decision: z.enum(['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']).optional().default('PENDIENTE')})
    ).optional(),
    tasks: z.array(
z.object({    task: z.coerce.string().min(1,'validation.required'),
    decision: z.enum(['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']).optional().default('PENDIENTE')})
    ).optional(),
    habits: z.array(
z.object({    habit: z.coerce.string().min(1,'validation.required'),
    decision: z.enum(['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']).optional().default('PENDIENTE')})
    ).optional(),
    suggestions: z.array(
z.object({    title: z.string().min(1,'validation.required'),
    decision: z.enum(['PENDIENTE', 'COMPROMETIDO', 'DESEABLE', 'DESCARTADO']).optional().default('PENDIENTE'),
    goal: z.coerce.string().optional().nullable(),
    project: z.coerce.string().optional().nullable()})
    ).optional()
});

const DayPlanSchema = DayPlanBaseSchema
    .extend({
      _id: z.coerce.string(),
       
    })

export default DayPlanSchema;
export {DayPlanSchema, DayPlanBaseSchema}
