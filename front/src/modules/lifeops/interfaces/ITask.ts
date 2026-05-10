
interface ITaskBase {
    title: string
    description?: string
    source?: string
    type?: string
    status?: string
    priority?: string
    goals?: Array<any>
    project?: any
    client?: any
    contacts?: Array<any>
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    urgencyScore?: number
    dueDate?: Date
    scheduledDate?: Date
    completedAt?: Date
    estimatedMinutes?: number
    spentMinutes?: number
    nextAction?: string
    redmineIssueId?: string
    emailMessageId?: string
    calendarEventId?: string
    tags?: Array<string>
    notes?: string
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface ITask {
    _id: string
    title: string
    description?: string
    source?: string
    type?: string
    status?: string
    priority?: string
    goals?: Array<any>
    project?: any
    client?: any
    contacts?: Array<any>
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    urgencyScore?: number
    dueDate?: Date
    scheduledDate?: Date
    completedAt?: Date
    estimatedMinutes?: number
    spentMinutes?: number
    nextAction?: string
    redmineIssueId?: string
    emailMessageId?: string
    calendarEventId?: string
    tags?: Array<string>
    notes?: string
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITaskBase, 
ITask
}
