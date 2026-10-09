
const messages = {
  en: {

    businesspartner: {
          entity: 'Business Partner',
          menu: 'Business Partner',
          crud: 'Manage Business Partner',
          field:{
                       name:'name',
           legalName:'legalName',
           taxCondition:'taxCondition',
           taxIdType:'taxIdType',
           taxIdNumber:'taxIdNumber',
           taxAddress:'taxAddress',
           taxEmail:'taxEmail',
           description:'description',
           roles:'roles',
           priority:'priority',
           website:'website',
           aliases:'aliases',
           mainContact:'mainContact',
           redmineProjectIds:'redmineProjectIds',
           tags:'tags',
           notes:'notes',
           user:'user',
           archivedAt:'archivedAt'
          }
      },
      permission: {
              'businesspartner:view': 'View Business Partner',
              'businesspartner:create': 'Create Business Partner',
              'businesspartner:update': 'Edit Business Partner',
              'businesspartner:delete': 'Delete Business Partner',
              'businesspartner:manage': 'Manage Business Partner',
      }
  },
  es: {
     businesspartner: {
          entity: 'socio comercial',
          menu: 'socio comercial',
          crud: 'Gestionar socio comercial',
          field:{
                       name:'name',
           legalName:'legalName',
           taxCondition:'taxCondition',
           taxIdType:'taxIdType',
           taxIdNumber:'taxIdNumber',
           taxAddress:'taxAddress',
           taxEmail:'taxEmail',
           description:'description',
           roles:'roles',
           priority:'priority',
           website:'website',
           aliases:'aliases',
           mainContact:'mainContact',
           redmineProjectIds:'redmineProjectIds',
           tags:'tags',
           notes:'notes',
           user:'user',
           archivedAt:'archivedAt'
          }
      },
     permission: {
              'businesspartner:view': 'Ver socio comercial',
              'businesspartner:create': 'Crear socio comercial',
              'businesspartner:update': 'Editar socio comercial',
              'businesspartner:delete': 'Eliminar socio comercial',
              'businesspartner:manage': 'Gestionar socio comercial',
     }
  }
}

export default messages;
