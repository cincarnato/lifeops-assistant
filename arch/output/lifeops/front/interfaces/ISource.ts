
interface ISourceBase {
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ISource {
    _id: string
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ISourceBase, 
ISource
}
