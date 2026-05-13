
import { z } from 'zod';


const AgentJobBaseSchema = z.object({
      name: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    active: z.boolean().optional(),
    agent: z.object({    systemPrompt: z.string().min(1,'validation.required'),
    allowedTools: z.array(z.string()).optional().default([])}),
    schedule: z.object({    type: z.enum(['once', 'daily', 'weekly', 'monthly', 'interval', 'cron']),
    timezone: z.string().min(1,'validation.required').default('America/Argentina/Buenos_Aires'),
    runAt: z.coerce.date().nullable().optional(),
    time: z.string().optional(),
    daysOfWeek: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
    daysOfMonth: z.array(z.number()).optional(),
    interval: z.object({    every: z.number().nullable().optional(),
    unit: z.enum(['minutes', 'hours', 'days']).optional()}),
    cronExpression: z.string().optional()}),
    execution: z.object({    timeoutSeconds: z.number().nullable().optional().default(300),
    maxRetries: z.number().nullable().optional()}),
    runtime: z.object({    lastRunAt: z.coerce.date().nullable().optional(),
    nextRunAt: z.coerce.date().nullable().optional(),
    lastStatus: z.enum(['success', 'failed', 'timeout']).optional()}),
    createdBy: z.coerce.string().optional()
});

const AgentJobSchema = AgentJobBaseSchema
    .extend({
      _id: z.coerce.string(),
       createdBy: z.object({_id: z.coerce.string(), username: z.string()}).nullable().optional()
    })

export default AgentJobSchema;
export {AgentJobSchema, AgentJobBaseSchema}
