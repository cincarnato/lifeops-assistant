
interface ITaskStatusBase {
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ITaskStatus {
    _id: string
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITaskStatusBase, 
ITaskStatus
}
