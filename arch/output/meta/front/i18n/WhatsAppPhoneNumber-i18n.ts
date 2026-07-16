
const messages = {
  en: {
  
    whatsappphonenumber: {
          entity: 'WhatsAppPhoneNumber',
          menu: 'WhatsAppPhoneNumber',
          crud: 'Manage WhatsAppPhoneNumber',
          field:{
                       tenantId:'tenantId',
           phoneNumberId:'phoneNumberId',
           wabaId:'wabaId',
           displayPhoneNumber:'displayPhoneNumber',
           enabled:'enabled'
          }
      },
      permission: {
              'whatsappphonenumber:view': 'View WhatsAppPhoneNumber',
              'whatsappphonenumber:create': 'Create WhatsAppPhoneNumber',
              'whatsappphonenumber:update': 'Edit WhatsAppPhoneNumber',
              'whatsappphonenumber:delete': 'Delete WhatsAppPhoneNumber',
              'whatsappphonenumber:manage': 'Manage WhatsAppPhoneNumber',
      }
  },
  es: {
     whatsappphonenumber: {
          entity: 'WhatsAppPhoneNumber',
          menu: 'WhatsAppPhoneNumber',
          crud: 'Gestionar WhatsAppPhoneNumber',
          field:{
                       tenantId:'tenantId',
           phoneNumberId:'phoneNumberId',
           wabaId:'wabaId',
           displayPhoneNumber:'displayPhoneNumber',
           enabled:'enabled'
          }
      },
     permission: {
              'whatsappphonenumber:view': 'Ver WhatsAppPhoneNumber',
              'whatsappphonenumber:create': 'Crear WhatsAppPhoneNumber',
              'whatsappphonenumber:update': 'Editar WhatsAppPhoneNumber',
              'whatsappphonenumber:delete': 'Eliminar WhatsAppPhoneNumber',
              'whatsappphonenumber:manage': 'Gestionar WhatsAppPhoneNumber',
     }
  }
}

export default messages;  
