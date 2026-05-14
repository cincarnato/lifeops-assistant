
interface IMemoryBase {
    title: string
    content: string
    type: string
    tags?: Array<string>
    importance?: string
    source?: string
    createdAt?: Date
    updatedAt?: Date
}

interface IMemory {
    _id: string
    title: string
    content: string
    type: string
    tags?: Array<string>
    importance?: string
    source?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IMemoryBase, 
IMemory
}
