
import { z } from 'zod';


const TaskBaseSchema = z.object({
      title: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    source: z.coerce.string().optional().nullable(),
    type: z.coerce.string().optional().nullable(),
    status: z.coerce.string().optional().nullable(),
    priority: z.coerce.string().optional().nullable(),
    goals: z.array(z.coerce.string()).optional(),
    project: z.coerce.string().optional().nullable(),
    client: z.coerce.string().optional().nullable(),
    contacts: z.array(z.coerce.string()).optional(),
    valueScore: z.number().nullable().optional().default(5),
    motivationScore: z.number().nullable().optional().default(5),
    effortScore: z.number().nullable().optional().default(5),
    urgencyScore: z.number().nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    scheduledDate: z.coerce.date().nullable().optional(),
    completedAt: z.coerce.date().nullable().optional(),
    estimatedMinutes: z.number().nullable().optional().default(1),
    spentMinutes: z.number().nullable().optional().default(1),
    nextAction: z.string().optional(),
    redmineIssueId: z.string().optional(),
    emailMessageId: z.string().optional(),
    calendarEventId: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    notes: z.string().optional(),
    user: z.coerce.string().min(1,'validation.required'),
    archivedAt: z.coerce.date().nullable().optional()
});

const TaskSchema = TaskBaseSchema
    .extend({
      _id: z.coerce.string(),
goals: z.array(z.object({_id: z.coerce.string(), name: z.string()})).optional(),
project: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
client: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
contacts: z.array(z.object({_id: z.coerce.string(), displayName: z.string()})).optional(),
user: z.object({_id: z.coerce.string(), username: z.string()})
    })

export default TaskSchema;
export {TaskSchema, TaskBaseSchema}
