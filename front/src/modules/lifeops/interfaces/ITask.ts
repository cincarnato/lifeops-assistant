
type TaskImportance = 'HIGH' | 'MEDIUM' | 'LOW'

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
    instruction?: string | null
    title: string
    description?: string
    source?: string
    type?: string
    lifeArea?: string
    status?: string
    priority?: string
    importance?: TaskImportance | null
    goals?: Array<any>
    project?: any
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    urgent?: boolean
    delegable?: boolean
    delegate?: any
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
    instruction?: import('./IInstruction').IInstruction | null
    _id: string
    title: string
    description?: string
    source?: string
    type?: string
    lifeArea?: string
    status?: string
    priority?: string
    importance?: TaskImportance | null
    goals?: Array<any>
    project?: any
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    urgent?: boolean
    delegable?: boolean
    delegate?: any
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
TaskImportance,
ITaskBase,
ITask,
ITaskNote,
ITaskStatusHistory
}
