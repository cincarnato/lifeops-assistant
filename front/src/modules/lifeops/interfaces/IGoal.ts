
interface IGoalBase {
    name: string
    description?: string
    status?: string
    priority?: string
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    timeHorizon?: string
    targetDate?: Date
    completedAt?: Date
    archivedAt?: Date
    progressPercent?: number
    successCriteria?: string
    purpose?: string
    constraints?: Array<string>
    tags?: Array<string>
    user: any
    createdAt?: Date
    updatedAt?: Date
}

interface IGoal {
    _id: string
    name: string
    description?: string
    status?: string
    priority?: string
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    timeHorizon?: string
    targetDate?: Date
    completedAt?: Date
    archivedAt?: Date
    progressPercent?: number
    successCriteria?: string
    purpose?: string
    constraints?: Array<string>
    tags?: Array<string>
    user: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IGoalBase, 
IGoal
}
