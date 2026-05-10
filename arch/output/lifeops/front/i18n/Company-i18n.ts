
const messages = {
  en: {
  
    company: {
          entity: 'Company',
          menu: 'Company',
          crud: 'Manage Company',
          field:{
                       name:'name',
           legalName:'legalName',
           taxIdType:'taxIdType',
           taxIdNumber:'taxIdNumber',
           description:'description',
           type:'type',
           status:'status',
           website:'website',
           emailDomains:'emailDomains',
           tags:'tags',
           notes:'notes',
           user:'user',
           archivedAt:'archivedAt'
          }
      },
      permission: {
              'company:view': 'View Company',
              'company:create': 'Create Company',
              'company:update': 'Edit Company',
              'company:delete': 'Delete Company',
              'company:manage': 'Manage Company',
      }
  },
  es: {
     company: {
          entity: 'Company',
          menu: 'Company',
          crud: 'Gestionar Company',
          field:{
                       name:'name',
           legalName:'legalName',
           taxIdType:'taxIdType',
           taxIdNumber:'taxIdNumber',
           description:'description',
           type:'type',
           status:'status',
           website:'website',
           emailDomains:'emailDomains',
           tags:'tags',
           notes:'notes',
           user:'user',
           archivedAt:'archivedAt'
          }
      },
     permission: {
              'company:view': 'Ver Company',
              'company:create': 'Crear Company',
              'company:update': 'Editar Company',
              'company:delete': 'Eliminar Company',
              'company:manage': 'Gestionar Company',
     }
  }
}

export default messages;  
