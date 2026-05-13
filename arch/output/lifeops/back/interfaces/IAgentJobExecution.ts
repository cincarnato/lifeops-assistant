
interface IAgentJobExecutionBase {
    jobId: any
    status: string
    trigger: string
    scheduledFor?: Date
    startedAt?: Date
    finishedAt?: Date
    durationMs?: number
    attempt?: number
    promptSnapshot?: {    systemPrompt?: string
    allowedTools?: Array<string>}
    result?: {    summary?: string
    actions?: Array<{
    type: string
    description?: string
    entityType?: string
    entityId?: string
    status?: string
    }>
    data?: Record<string, any>
    outcome?: string}
    toolCalls?: Array<{
    name: string
    status: string
    input?: Record<string, any>
    output?: Record<string, any>
    errorMessage?: string
    durationMs?: number
    }>
    error?: {    code?: string
    message?: string}
    usage?: {    model?: string
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number}
    createdAt?: Date
    updatedAt?: Date
}

interface IAgentJobExecution {
    _id: string
    jobId: any
    status: string
    trigger: string
    scheduledFor?: Date
    startedAt?: Date
    finishedAt?: Date
    durationMs?: number
    attempt?: number
    promptSnapshot?: {    systemPrompt?: string
    allowedTools?: Array<string>}
    result?: {    summary?: string
    actions?: Array<{
    type: string
    description?: string
    entityType?: string
    entityId?: string
    status?: string
    }>
    data?: Record<string, any>
    outcome?: string}
    toolCalls?: Array<{
    name: string
    status: string
    input?: Record<string, any>
    output?: Record<string, any>
    errorMessage?: string
    durationMs?: number
    }>
    error?: {    code?: string
    message?: string}
    usage?: {    model?: string
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number}
    createdAt?: Date
    updatedAt?: Date
}

export type {
IAgentJobExecutionBase, 
IAgentJobExecution
}
