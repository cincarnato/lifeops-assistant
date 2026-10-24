interface IDelegateBase {
    tenant?: any
    contact: any
    skills?: Array<string>
    description?: string
    active?: boolean
    user: any
    createdAt?: Date
    updatedAt?: Date
}

interface IDelegate {
    tenant?: any
    _id: string
    contact: any
    skills?: Array<string>
    description?: string
    active?: boolean
    user: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IDelegateBase,
IDelegate
}
