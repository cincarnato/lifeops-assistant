
interface IMemoryBase {
    tenant?: any
    title: string
    content: string
    type: string
    lifeArea?: string
    tags?: Array<string>
    priority?: string
    source?: string
    user: any
    createdAt?: Date
    updatedAt?: Date
}

interface IMemory {
    tenant?: any
    _id: string
    title: string
    content: string
    type: string
    lifeArea?: string
    tags?: Array<string>
    priority?: string
    source?: string
    user: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IMemoryBase, 
IMemory
}
