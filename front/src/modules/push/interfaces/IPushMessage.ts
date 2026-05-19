
interface IPushMessageBase {
    user: any
    title: string
    body: string
    status: string
    providerMessageId?: string
    type?: string
    errorMessage?: string
    sentAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

interface IPushMessage {
    _id: string
    user: any
    title: string
    body: string
    status: string
    providerMessageId?: string
    type?: string
    errorMessage?: string
    sentAt?: Date
    createdAt?: Date
    updatedAt?: Date
}

export type {
IPushMessageBase, 
IPushMessage
}
