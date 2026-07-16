
interface IWhatsAppPhoneNumberBase {
    tenantId: any
    phoneNumberId: string
    wabaId: string
    displayPhoneNumber: string
    enabled: boolean
    createdAt?: Date
    updatedAt?: Date
}

interface IWhatsAppPhoneNumber {
    _id: string
    tenantId: any
    phoneNumberId: string
    wabaId: string
    displayPhoneNumber: string
    enabled: boolean
    createdAt?: Date
    updatedAt?: Date
}

export type {
IWhatsAppPhoneNumberBase, 
IWhatsAppPhoneNumber
}
