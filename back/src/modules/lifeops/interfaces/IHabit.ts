
interface IHabitBase {
    name: string
    description?: string
    lifeArea?: string
    active?: boolean
    frequency: {    type: string}
    generateTask?: boolean
    taskTemplate?: {    title?: string
    description?: string
    estimatedMinutes?: number
    priority?: string}
    user: any
    createdAt?: Date
    updatedAt?: Date
}

interface IHabit {
    _id: string
    name: string
    description?: string
    lifeArea?: string
    active?: boolean
    frequency: {    type: string}
    generateTask?: boolean
    taskTemplate?: {    title?: string
    description?: string
    estimatedMinutes?: number
    priority?: string}
    user: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IHabitBase, 
IHabit
}
