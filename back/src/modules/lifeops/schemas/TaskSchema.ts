import {z} from 'zod';

const TaskBaseSchema = z.object({
    title: z.string().min(1, 'validation.required'),
    description: z.string().optional(),
    source: z.coerce.string().optional().nullable().default(null),
    type: z.coerce.string().optional().nullable().default(null),
    lifeArea: z.coerce.string().optional().nullable().default(null),
    status: z.coerce.string().optional().nullable().default(null),
    priority: z.coerce.string().optional().nullable().default(null),
    goals: z.array(z.coerce.string()).optional().default([]),
    project: z.coerce.string().optional().nullable().default(null),
    client: z.coerce.string().optional().nullable().default(null),
    contacts: z.array(z.coerce.string()).optional().default([]),
    valueScore: z.number().nullable().optional().default(5),
    motivationScore: z.number().nullable().optional().default(5),
    effortScore: z.number().nullable().optional().default(5),
    urgencyScore: z.number().nullable().optional().default(5),
    dueDate: z.coerce.date().nullable().optional().default(null),
    scheduledDate: z.coerce.date().nullable().optional().default(null),
    estimatedMinutes: z.number().nullable().optional().default(1),
    spentMinutes: z.number().nullable().optional().default(1),
    nextAction: z.string().optional(),
    redmineIssueId: z.string().optional(),
    emailMessageId: z.string().optional(),
    calendarEventId: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    notes: z.array(
        z.object({
            date: z.coerce.date().nullable().optional(),
            note: z.string().optional().default('')
        })
    ).optional().default([]),
    statusHistory: z.array(
        z.object({
            date: z.coerce.date().nullable().optional(),
            previousStatus: z.string().nullable().optional(),
            newStatus: z.string().nullable().optional()
        })
    ).optional().default([]),
    user: z.coerce.string().min(1, 'validation.required'),
    completedAt: z.coerce.date().nullable().optional(),
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
