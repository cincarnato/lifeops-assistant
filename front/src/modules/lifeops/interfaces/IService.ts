import type {IBusinessPartner} from './IBusinessPartner'

type ServiceType = 'INCOME' | 'EXPENSE'
type ServiceFrequency = 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ON_DEMAND'

interface IServiceBase {
    name: string
    businessPartner: string
    type: ServiceType
    amount: number
    frequency: ServiceFrequency
    active?: boolean
}

interface IService extends Omit<IServiceBase, 'businessPartner' | 'active'> {
    _id: string
    businessPartner: IBusinessPartner
    active: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
}

export type {IServiceBase, IService, ServiceType, ServiceFrequency}
