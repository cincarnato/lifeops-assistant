
interface IServiceBase {
    name: string
    businessPartner: any
    type: string
    amount: number
    frequency: string
    active: boolean
    createdAt?: Date
    updatedAt?: Date
}

interface IService {
    _id: string
    name: string
    businessPartner: any
    type: string
    amount: number
    frequency: string
    active: boolean
    createdAt?: Date
    updatedAt?: Date
}

export type {
IServiceBase,
IService
}
