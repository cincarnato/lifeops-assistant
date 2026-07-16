
interface IWhatsAppWebhookEventBase {
    tenantId?: any
    phoneNumberRef?: any
    object: string
    field: string
    wabaId?: string
    phoneNumberId?: string
    receivedAt: Date
    eventAt?: Date
    processingStatus: string
    processingAttempts: number
    processedAt?: Date
    lastProcessingAttemptAt?: Date
    lastError?: {    message?: string
    stack?: string
    code?: string}
    payload: {}
    deduplicationKey?: string
    createdAt?: Date
    updatedAt?: Date
}

interface IWhatsAppWebhookEvent {
    _id: string
    tenantId?: any
    phoneNumberRef?: any
    object: string
    field: string
    wabaId?: string
    phoneNumberId?: string
    receivedAt: Date
    eventAt?: Date
    processingStatus: string
    processingAttempts: number
    processedAt?: Date
    lastProcessingAttemptAt?: Date
    lastError?: {    message?: string
    stack?: string
    code?: string}
    payload: {}
    deduplicationKey?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IWhatsAppWebhookEventBase, 
IWhatsAppWebhookEvent
}
