interface IAgentJobBase {
  name: string
  description?: string
  active?: boolean
  agent: {
    systemPrompt: string
    allowedTools?: Array<string>
  }
  schedule: {
    type: string
    timezone: string
    runAt?: Date
    time?: string
    daysOfWeek?: Array<string>
    daysOfMonth?: Array<number>
    interval?: {
      every?: number
      unit?: string
    }
    cronExpression?: string
  }
  execution?: {
    timeoutSeconds?: number
    maxRetries?: number
  }
  runtime?: {
    lastRunAt?: Date
    nextRunAt?: Date
    lastStatus?: string
  }
  createdBy?: any
  createdAt?: Date
  updatedAt?: Date
}

interface IAgentJob {
  _id: string
  name: string
  description?: string
  active?: boolean
  agent: {
    systemPrompt: string
    allowedTools?: Array<string>
  }
  schedule: {
    type: string
    timezone: string
    runAt?: Date
    time?: string
    daysOfWeek?: Array<string>
    daysOfMonth?: Array<number>
    interval?: {
      every?: number
      unit?: string
    }
    cronExpression?: string
  }
  execution?: {
    timeoutSeconds?: number
    maxRetries?: number
  }
  runtime?: {
    lastRunAt?: Date
    nextRunAt?: Date
    lastStatus?: string
  }
  createdBy?: any
  createdAt?: Date
  updatedAt?: Date
}

export type {
  IAgentJobBase,
  IAgentJob
}
