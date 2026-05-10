
import { z } from 'zod';


const GoalBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    priority: z.string().optional().default(""),
    valueScore: z.number().min(1).max(10).nullable().optional().default(5),
    motivationScore: z.number().min(1).max(10).nullable().optional().default(5),
    effortScore: z.number().min(1).max(10).nullable().optional().default(5),
    timeHorizon: z.enum(['short_term', 'medium_term', 'long_term']).optional().default('medium_term'),
    targetDate: z.coerce.date().nullable().optional(),
    completedAt: z.coerce.date().nullable().optional(),
    archivedAt: z.coerce.date().nullable().optional(),
    progressPercent: z.number().min(0).max(100).nullable().optional().default(0),
    successCriteria: z.string().optional().default(""),
    purpose: z.string().optional().default(""),
    constraints: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    user: z.string().min(1,'validation.required')
});

const GoalSchema = GoalBaseSchema
    .extend({
      _id: z.coerce.string(),
       user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default GoalSchema;
export {GoalSchema, GoalBaseSchema}
