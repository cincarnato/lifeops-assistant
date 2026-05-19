
interface ITaskStatusHistory {
    date?: Date
    previousStatus?: string | null
    newStatus?: string | null
}

interface ITaskNote {
    date?: Date
    note: string
}

interface ITaskBase {
    title: string
    description?: string
    source?: string
    type?: string
    lifeArea?: string
    status?: string
    priority?: string
    goals?: Array<any>
    project?: any
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    urgencyScore?: number
    dueDate?: Date
    scheduledDate?: Date
    completedAt?: Date
    redmineIssueId?: string
    emailMessageId?: string
    calendarEventId?: string
    tags?: Array<string>
    notes?: Array<ITaskNote> | string | null
    statusHistory?: Array<ITaskStatusHistory>
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
    lifeArea?: string
    status?: string
    priority?: string
    goals?: Array<any>
    project?: any
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    urgencyScore?: number
    dueDate?: Date
    scheduledDate?: Date
    completedAt?: Date
    redmineIssueId?: string
    emailMessageId?: string
    calendarEventId?: string
    tags?: Array<string>
    notes?: Array<ITaskNote> | string | null
    statusHistory?: Array<ITaskStatusHistory>
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITaskBase,
ITask,
ITaskNote,
ITaskStatusHistory
}
