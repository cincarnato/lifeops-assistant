
import { z } from 'zod';


const AgentJobExecutionBaseSchema = z.object({
      jobId: z.coerce.string().min(1,'validation.required'),
    status: z.enum(['pending', 'running', 'success', 'failed', 'timeout']),
    trigger: z.enum(['scheduled', 'manual', 'retry']).default('scheduled'),
    scheduledFor: z.coerce.date().nullable().optional(),
    startedAt: z.coerce.date().nullable().optional(),
    finishedAt: z.coerce.date().nullable().optional(),
    durationMs: z.number().nullable().optional(),
    attempt: z.number().nullable().optional().default(1),
    promptSnapshot: z.object({    systemPrompt: z.string().optional(),
    allowedTools: z.array(z.string()).optional().default([])}),
    result: z.object({    summary: z.string().optional(),
    actions: z.array(
z.object({    type: z.string().min(1,'validation.required'),
    description: z.string().optional(),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    status: z.enum(['success', 'failed']).optional().default('success')})
    ).optional(),
    data: z.record(z.string(),z.unknown()).optional().nullable(),
    outcome: z.string().optional()}),
    toolCalls: z.array(
z.object({    name: z.string().min(1,'validation.required'),
    status: z.enum(['success', 'failed']),
    input: z.record(z.string(),z.unknown()).optional().nullable(),
    output: z.record(z.string(),z.unknown()).optional().nullable(),
    errorMessage: z.string().optional(),
    durationMs: z.number().nullable().optional()})
    ).optional(),
    error: z.object({    code: z.string().optional(),
    message: z.string().optional()}),
    usage: z.object({    model: z.string().optional(),
    inputTokens: z.number().nullable().optional(),
    outputTokens: z.number().nullable().optional(),
    totalTokens: z.number().nullable().optional()})
});

const AgentJobExecutionSchema = AgentJobExecutionBaseSchema
    .extend({
      _id: z.coerce.string(),
       jobId: z.object({_id: z.coerce.string(), name: z.string()})
    })

export default AgentJobExecutionSchema;
export {AgentJobExecutionSchema, AgentJobExecutionBaseSchema}
