
interface ITaskTypeBase {
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ITaskType {
    _id: string
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITaskTypeBase, 
ITaskType
}
