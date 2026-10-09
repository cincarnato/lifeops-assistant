import type {IService} from './IService'

type ServiceTransactionStatus = 'PENDING' | 'PAID'

interface IServiceTransactionBase {
    service: string
    period: string
    amount?: number
    status?: ServiceTransactionStatus
}

interface IServiceTransaction extends Omit<IServiceTransactionBase, 'service' | 'amount' | 'status'> {
    _id: string
    service: IService
    amount: number
    status: ServiceTransactionStatus
    paidAt: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
}

export type {IServiceTransactionBase, IServiceTransaction, ServiceTransactionStatus}
