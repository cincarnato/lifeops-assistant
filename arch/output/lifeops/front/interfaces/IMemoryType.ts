
interface IMemoryTypeBase {
    name: string
    description: string
    createdAt?: Date
    updatedAt?: Date
}

interface IMemoryType {
    _id: string
    name: string
    description: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IMemoryTypeBase, 
IMemoryType
}
