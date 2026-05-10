
interface IClientTypeBase {
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

interface IClientType {
    _id: string
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IClientTypeBase, 
IClientType
}
