
interface IGoalBase {
    name: string
    description?: string
    status?: string
    priority?: string
    valueScore?: number
    motivationScore?: number
    effortScore?: number
    lifeArea?: string
    timeHorizon?: string
    targetDate?: Date
    completedAt?: Date
    archivedAt?: Date
    progressPercent?: number
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
    lifeArea?: string
    timeHorizon?: string
    targetDate?: Date
    completedAt?: Date
    archivedAt?: Date
    progressPercent?: number
    user: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IGoalBase, 
IGoal
}
