
const messages = {
  en: {
  
    whatsappwebhookevent: {
          entity: 'WhatsAppWebhookEvent',
          menu: 'WhatsAppWebhookEvent',
          crud: 'Manage WhatsAppWebhookEvent',
          field:{
                       tenantId:'tenantId',
           phoneNumberRef:'phoneNumberRef',
           object:'object',
           field:'field',
           wabaId:'wabaId',
           phoneNumberId:'phoneNumberId',
           receivedAt:'receivedAt',
           eventAt:'eventAt',
           processingStatus:'processingStatus',
           processingAttempts:'processingAttempts',
           processedAt:'processedAt',
           lastProcessingAttemptAt:'lastProcessingAttemptAt',
           lastError:'lastError',
           message: 'message',
           stack: 'stack',
           code: 'code',
           payload:'payload',
           deduplicationKey:'deduplicationKey'
          },
          ui: {
            copyJson: 'Copy JSON',
            invalidJson: 'Invalid JSON',
            payloadObjectRequired: 'The JSON root must be an object'
          }
      },
      permission: {
              'whatsappwebhookevent:view': 'View WhatsAppWebhookEvent',
              'whatsappwebhookevent:create': 'Create WhatsAppWebhookEvent',
              'whatsappwebhookevent:update': 'Edit WhatsAppWebhookEvent',
              'whatsappwebhookevent:delete': 'Delete WhatsAppWebhookEvent',
              'whatsappwebhookevent:manage': 'Manage WhatsAppWebhookEvent',
      }
  },
  es: {
     whatsappwebhookevent: {
          entity: 'WhatsAppWebhookEvent',
          menu: 'WhatsAppWebhookEvent',
          crud: 'Gestionar WhatsAppWebhookEvent',
          field:{
                       tenantId:'tenantId',
           phoneNumberRef:'phoneNumberRef',
           object:'object',
           field:'field',
           wabaId:'wabaId',
           phoneNumberId:'phoneNumberId',
           receivedAt:'receivedAt',
           eventAt:'eventAt',
           processingStatus:'processingStatus',
           processingAttempts:'processingAttempts',
           processedAt:'processedAt',
           lastProcessingAttemptAt:'lastProcessingAttemptAt',
           lastError:'lastError',
           message: 'message',
           stack: 'stack',
           code: 'code',
           payload:'payload',
           deduplicationKey:'deduplicationKey'
          },
          ui: {
            copyJson: 'Copiar JSON',
            invalidJson: 'JSON inválido',
            payloadObjectRequired: 'La raíz del JSON debe ser un objeto'
          }
      },
     permission: {
              'whatsappwebhookevent:view': 'Ver WhatsAppWebhookEvent',
              'whatsappwebhookevent:create': 'Crear WhatsAppWebhookEvent',
              'whatsappwebhookevent:update': 'Editar WhatsAppWebhookEvent',
              'whatsappwebhookevent:delete': 'Eliminar WhatsAppWebhookEvent',
              'whatsappwebhookevent:manage': 'Gestionar WhatsAppWebhookEvent',
     }
  }
}

export default messages;  
