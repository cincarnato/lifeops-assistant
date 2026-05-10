
const messages = {
  en: {
  
    client: {
          entity: 'Client',
          menu: 'Client',
          crud: 'Manage Client',
          field:{
                       name:'name',
           description:'description',
           type:'type',
           status:'status',
           priority:'priority',
           valueScore:'valueScore',
           relationshipScore:'relationshipScore',
           priorityScore:'priorityScore',
           website:'website',
           emailDomains:'emailDomains',
           company:'company',
           mainContact:'mainContact',
           redmineProjectIds:'redmineProjectIds',
           tags:'tags',
           notes:'notes',
           user:'user',
           archivedAt:'archivedAt'
          }
      },
      permission: {
              'client:view': 'View Client',
              'client:create': 'Create Client',
              'client:update': 'Edit Client',
              'client:delete': 'Delete Client',
              'client:manage': 'Manage Client',
      }
  },
  es: {
     client: {
          entity: 'Client',
          menu: 'Client',
          crud: 'Gestionar Client',
          field:{
                       name:'name',
           description:'description',
           type:'type',
           status:'status',
           priority:'priority',
           valueScore:'valueScore',
           relationshipScore:'relationshipScore',
           priorityScore:'priorityScore',
           website:'website',
           emailDomains:'emailDomains',
           company:'company',
           mainContact:'mainContact',
           redmineProjectIds:'redmineProjectIds',
           tags:'tags',
           notes:'notes',
           user:'user',
           archivedAt:'archivedAt'
          }
      },
     permission: {
              'client:view': 'Ver Client',
              'client:create': 'Crear Client',
              'client:update': 'Editar Client',
              'client:delete': 'Eliminar Client',
              'client:manage': 'Gestionar Client',
     }
  }
}

export default messages;  
