
interface ITaskSourceBase {
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ITaskSource {
    _id: string
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ITaskSourceBase, 
ITaskSource
}
