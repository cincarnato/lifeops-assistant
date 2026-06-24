
import { z } from 'zod';


const GoalBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled', 'archived']).optional().default('draft'),
    priority: z.string().optional(),
    valueScore: z.number().nullable().optional().default(5),
    motivationScore: z.number().nullable().optional().default(5),
    effortScore: z.number().nullable().optional().default(5),
    lifeArea: z.string().optional(),
    timeHorizon: z.enum(['short_term', 'medium_term', 'long_term']).optional().default('medium_term'),
    targetDate: z.coerce.date().nullable().optional(),
    completedAt: z.coerce.date().nullable().optional(),
    archivedAt: z.coerce.date().nullable().optional(),
    progressPercent: z.number().nullable().optional(),
    user: z.coerce.string().min(1,'validation.required')
});

const GoalSchema = GoalBaseSchema
    .extend({
      _id: z.coerce.string(),
       user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default GoalSchema;
export {GoalSchema, GoalBaseSchema}
