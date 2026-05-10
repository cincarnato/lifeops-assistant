
const messages = {
  en: {
  
    contact: {
          entity: 'Contact',
          menu: 'Contact',
          crud: 'Manage Contact',
          field:{
                       firstName:'firstName',
           lastName:'lastName',
           displayName:'displayName',
           type:'type',
           status:'status',
           priority:'priority',
           client:'client',
           company:'company',
           jobTitle:'jobTitle',
           department:'department',
           emails:'emails',
           phones:'phones',
           valueScore:'valueScore',
           relationshipScore:'relationshipScore',
           tags:'tags',
           notes:'notes',
           user:'user',
           archivedAt:'archivedAt'
          }
      },
      permission: {
              'contact:view': 'View Contact',
              'contact:create': 'Create Contact',
              'contact:update': 'Edit Contact',
              'contact:delete': 'Delete Contact',
              'contact:manage': 'Manage Contact',
      }
  },
  es: {
     contact: {
          entity: 'Contact',
          menu: 'Contact',
          crud: 'Gestionar Contact',
          field:{
                       firstName:'firstName',
           lastName:'lastName',
           displayName:'displayName',
           type:'type',
           status:'status',
           priority:'priority',
           client:'client',
           company:'company',
           jobTitle:'jobTitle',
           department:'department',
           emails:'emails',
           phones:'phones',
           valueScore:'valueScore',
           relationshipScore:'relationshipScore',
           tags:'tags',
           notes:'notes',
           user:'user',
           archivedAt:'archivedAt'
          }
      },
     permission: {
              'contact:view': 'Ver Contact',
              'contact:create': 'Crear Contact',
              'contact:update': 'Editar Contact',
              'contact:delete': 'Eliminar Contact',
              'contact:manage': 'Gestionar Contact',
     }
  }
}

export default messages;  
