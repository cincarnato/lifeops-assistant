
interface IPurposeBase {
    tenant?: any
    title: string
    statement: string
    isPrimary?: boolean
    active?: boolean
    user: any
    createdAt?: Date
    updatedAt?: Date
}

interface IPurpose {
    tenant?: any
    _id: string
    title: string
    statement: string
    isPrimary?: boolean
    active?: boolean
    user: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IPurposeBase, 
IPurpose
}
