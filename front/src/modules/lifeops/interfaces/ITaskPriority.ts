
interface ITaskPriorityBase {
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ITaskPriority {
    _id: string
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITaskPriorityBase, 
ITaskPriority
}
