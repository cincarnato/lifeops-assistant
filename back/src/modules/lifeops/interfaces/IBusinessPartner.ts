
interface IBusinessPartnerBase {
    tenant?: any
    name: string
    legalName?: string
    taxCondition?: string
    taxIdType?: string
    taxIdNumber?: string
    taxAddress?: string
    taxEmail?: string
    bankCbu?: string
    bankAlias?: string
    bankAccount?: string
    bankName?: string
    paymentReceiptEmail?: string
    paymentReceiptUrl?: string
    description?: string
    roles: Array<'client' | 'provider'>
    priority?: string
    website?: string
    aliases?: Array<string>
    mainContact?: any
    tags?: Array<string>
    notes?: string
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IBusinessPartner {
    tenant?: any
    _id: string
    name: string
    legalName?: string
    taxCondition?: string
    taxIdType?: string
    taxIdNumber?: string
    taxAddress?: string
    taxEmail?: string
    bankCbu?: string
    bankAlias?: string
    bankAccount?: string
    bankName?: string
    paymentReceiptEmail?: string
    paymentReceiptUrl?: string
    description?: string
    roles: Array<'client' | 'provider'>
    priority?: string
    website?: string
    aliases?: Array<string>
    mainContact?: any
    tags?: Array<string>
    notes?: string
    user: any
    archivedAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IBusinessPartnerBase,
IBusinessPartner
}
