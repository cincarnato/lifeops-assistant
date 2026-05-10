
interface IProjectBase {
    name: string
    description?: string
    status?: string
    priority?: string
    goals?: Array<any>
    client?: any
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    priorityScore?: number
    startDate?: Date
    targetDate?: Date
    completedAt?: Date
    progressPercent?: number
    tags?: Array<string>
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IProject {
    _id: string
    name: string
    description?: string
    status?: string
    priority?: string
    goals?: Array<any>
    client?: any
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    priorityScore?: number
    startDate?: Date
    targetDate?: Date
    completedAt?: Date
    progressPercent?: number
    tags?: Array<string>
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IProjectBase, 
IProject
}
