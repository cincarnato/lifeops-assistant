
import { z } from 'zod';


const ProjectBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional().default(""),
    status: z.enum(['idea', 'active', 'paused', 'completed', 'cancelled', 'archived']).optional().default('idea'),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
    goals: z.array(z.coerce.string()).optional(),
    client: z.coerce.string().optional().nullable().default(null),
    valueScore: z.number().nullable().optional().default(5),
    motivationScore: z.number().nullable().optional().default(5),
    effortScore: z.number().nullable().optional().default(5),
    priorityScore: z.number().nullable().optional().default(5),
    startDate: z.coerce.date().nullable().optional(),
    targetDate: z.coerce.date().nullable().optional(),
    completedAt: z.coerce.date().nullable().optional(),
    progressPercent: z.number().nullable().optional().default(0),
    tags: z.array(z.string()).optional().default([]),
    user: z.coerce.string().min(1,'validation.required'),
    archivedAt: z.coerce.date().nullable().optional()
});

const ProjectSchema = ProjectBaseSchema
    .extend({
      _id: z.coerce.string(),
       goals: z.array(z.object({_id: z.coerce.string(), name: z.string()})).optional(),
client: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default ProjectSchema;
export {ProjectSchema, ProjectBaseSchema}
