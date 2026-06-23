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
    valueScore: z.number().nullable().optional().default(null),
    motivationScore: z.number().nullable().optional().default(null),
    effortScore: z.number().nullable().optional().default(null),
    urgencyScore: z.number().nullable().optional().default(null),
    dueDate: z.coerce.date().nullable().optional().default(null),
    scheduledDate: z.coerce.date().nullable().optional().default(null),
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

    user: z.coerce.string().min(1, 'validation.required'),

});

const TaskSchema = TaskBaseSchema
    .extend({
        _id: z.coerce.string(),
        goals: z.array(z.object({_id: z.coerce.string(), name: z.string()})).optional(),
        project: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        user: z.object({_id: z.coerce.string(), username: z.string()}),
        createdAt: z.coerce.date().nullable().optional(),
        updatedAt: z.coerce.date().nullable().optional(),
        statusHistory: z.array(
            z.object({
                date: z.coerce.date().nullable().optional(),
                previousStatus: z.string().nullable().optional(),
                newStatus: z.string().nullable().optional()
            })
        ).optional().default([]),
        completedAt: z.coerce.date().nullable().optional().default(null),
        archivedAt: z.coerce.date().nullable().optional().default(null)
    })

export default TaskSchema;
export {TaskSchema, TaskBaseSchema}
