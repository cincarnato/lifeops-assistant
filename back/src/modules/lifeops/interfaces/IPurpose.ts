
interface IPurposeBase {
    title: string
    statement: string
    isPrimary?: boolean
    active?: boolean
    user: any
    createdAt?: Date
    updatedAt?: Date
}

interface IPurpose {
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
