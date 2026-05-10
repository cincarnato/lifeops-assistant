
interface IPriorityBase {
    name: string
    description?: string
    color: string
    createdAt?: Date
    updatedAt?: Date
}

interface IPriority {
    _id: string
    name: string
    description?: string
    color: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IPriorityBase, 
IPriority
}
