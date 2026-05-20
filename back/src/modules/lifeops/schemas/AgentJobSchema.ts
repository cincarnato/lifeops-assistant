import {z} from 'zod';


const AgentJobBaseSchema = z.object({
    name: z.string().trim().min(1, 'validation.required').max(120),
    description: z.string().trim().max(500).optional(),
    active: z.boolean().optional().default(true),
    agent: z.object({
        systemPrompt: z.string().min(1, 'validation.required'),
        allowedTools: z.array(z.string()).optional().default([])
    }),
    schedule: z.object({
        type: z.enum(['once', 'daily', 'weekly', 'monthly', 'interval', 'cron']),
        timezone: z.string().min(1, 'validation.required').default('America/Argentina/Buenos_Aires'),
        runAt: z.coerce.date().nullable().optional(),
        time: z.string().optional(),
        daysOfWeek: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
        daysOfMonth: z.array(z.number().min(1).max(31)).optional(),
        interval: z.object({
            every: z.number().min(1).nullable().optional(),
            unit: z.enum(['minutes', 'hours', 'days']).optional()
        }).optional(),
        cronExpression: z.string().optional()
    }),
    execution: z.object({
        timeoutSeconds: z.number().nullable().optional().default(300),
        maxRetries: z.number().nullable().optional().default(0)
    }).optional().default({timeoutSeconds: 300, maxRetries: 0}),
    runtime: z.object({
        lastRunAt: z.coerce.date().nullable().optional(),
        nextRunAt: z.coerce.date().nullable().optional(),
        lastStatus: z.enum(['success', 'failed', 'timeout']).optional(). default("success")
    }).optional(),
    createdBy: z.coerce.string().optional()
});

const AgentJobSchema = AgentJobBaseSchema
    .extend({
        _id: z.coerce.string(),
        createdBy: z.object({_id: z.coerce.string(), username: z.string()}).nullable().optional(),
        createdAt: z.coerce.date().nullable().optional(),
        updatedAt: z.coerce.date().nullable().optional(),
    })

export default AgentJobSchema;
export {AgentJobSchema, AgentJobBaseSchema}
