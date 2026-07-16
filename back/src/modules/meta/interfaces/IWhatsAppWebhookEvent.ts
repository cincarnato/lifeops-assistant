
type WhatsAppWebhookProcessingStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'PROCESSED'
    | 'IGNORED'
    | 'ERROR';


interface IWhatsAppWebhookEventLastError {
    message?: string
    stack?: string
    code?: string
}

interface IWhatsAppWebhookEventBase {
    tenantId?: any
    phoneNumberRef?: any
    object: string
    field: string
    wabaId?: string
    phoneNumberId?: string
    receivedAt: Date
    eventAt?: Date
    processingStatus: WhatsAppWebhookProcessingStatus
    processingAttempts: number
    processedAt?: Date
    lastProcessingAttemptAt?: Date
    lastError?: IWhatsAppWebhookEventLastError
    payload: object
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
    processingStatus: WhatsAppWebhookProcessingStatus
    processingAttempts: number
    processedAt?: Date
    lastProcessingAttemptAt?: Date
    lastError?: IWhatsAppWebhookEventLastError
    payload: object
    deduplicationKey?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
IWhatsAppWebhookEventBase,
IWhatsAppWebhookEvent,
IWhatsAppWebhookEventLastError,
WhatsAppWebhookProcessingStatus
}
