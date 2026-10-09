
interface IServiceTransactionBase {
    service: any
    period: string
    amount: number
    status: string
    paidAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IServiceTransaction {
    _id: string
    service: any
    period: string
    amount: number
    status: string
    paidAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IServiceTransactionBase,
IServiceTransaction
}
