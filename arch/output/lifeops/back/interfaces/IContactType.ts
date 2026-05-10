
interface IContactTypeBase {
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

interface IContactType {
    _id: string
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IContactTypeBase, 
IContactType
}
