interface IDelegateBase {
    contact: any
    skills?: Array<string>
    description?: string
    active?: boolean
    user: any
    createdAt?: Date
    updatedAt?: Date
}

interface IDelegate {
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
