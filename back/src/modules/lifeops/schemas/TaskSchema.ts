import {z} from 'zod';
import {InstructionSchema} from './InstructionSchema.js';

const TaskBaseSchema = z.object({
    tenant: z.string().nullable().optional(),
    title: z.string().min(1, 'validation.required'),
    description: z.string().optional(),
    instruction: z.string().regex(/^[a-f\d]{24}$/i, 'validation.invalid').nullable().optional(),
    source: z.coerce.string().optional().nullable().default(null),
    type: z.coerce.string().optional().nullable().default(null),
    lifeArea: z.coerce.string().optional().nullable().default(null),
    status: z.coerce.string().optional().nullable().default(null),
    priority: z.coerce.string().optional().nullable().default(null),
    importance: z.enum(['HIGH', 'MEDIUM', 'LOW']).nullable().optional(),
    goals: z.array(z.coerce.string()).optional().default([]),
    project: z.coerce.string().optional().nullable().default(null),
    valueScore: z.number().nullable().optional().default(null),
    motivationScore: z.number().nullable().optional().default(null),
    effortScore: z.number().nullable().optional().default(null),
    urgent: z.boolean().optional().default(false),
    delegable: z.boolean().optional(),
    delegate: z.string().regex(/^[a-f\d]{24}$/i, 'validation.invalid').nullable().optional(),
    dueDate: z.coerce.date().nullable().optional().default(null),
    scheduledDate: z.coerce.date().nullable().optional().default(null),
    taskSchedule: z.coerce.string().optional().nullable(),
    scheduledFor: z.coerce.date().nullable().optional(),
    redmineIssueId: z.string().optional(),
    emailMessageId: z.string().optional(),
    calendarEventId: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    notes: z.array(
        z.object({
            date: z.coerce.date().nullable().optional(),
            note: z.string().optional().default('')
        })
    ).optional(),
    statusHistory: z.array(
        z.object({
            date: z.coerce.date().nullable().optional(),
            previousStatus: z.string().nullable().optional(),
            newStatus: z.string().nullable().optional()
        })
    ).optional().default([]),
    completedAt: z.coerce.date().nullable().optional().default(null),
    archivedAt: z.coerce.date().nullable().optional().default(null),

    user: z.coerce.string().min(1, 'validation.required'),

});

const TaskSchema = TaskBaseSchema
    .extend({
        _id: z.coerce.string(),
        tenant: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        instruction: InstructionSchema.nullable().optional(),
        goals: z.array(z.object({_id: z.coerce.string(), name: z.string()})).optional(),
        project: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
        delegate: z.object({
            _id: z.coerce.string(),
            contact: z.object({_id: z.coerce.string(), displayName: z.string()}).nullable().optional()
        }).nullable().optional(),
        taskSchedule: z.object({_id: z.coerce.string(), name: z.string()}).nullable().optional(),
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
