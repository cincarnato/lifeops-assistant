
const messages = {
  en: {
  
    contacttype: {
          entity: 'ContactType',
          menu: 'ContactType',
          crud: 'Manage ContactType',
          field:{
                       name:'name',
           description:'description'
          }
      },
      permission: {
              'contacttype:view': 'View ContactType',
              'contacttype:create': 'Create ContactType',
              'contacttype:update': 'Edit ContactType',
              'contacttype:delete': 'Delete ContactType',
              'contacttype:manage': 'Manage ContactType',
      }
  },
  es: {
     contacttype: {
          entity: 'ContactType',
          menu: 'ContactType',
          crud: 'Gestionar ContactType',
          field:{
                       name:'name',
           description:'description'
          }
      },
     permission: {
              'contacttype:view': 'Ver ContactType',
              'contacttype:create': 'Crear ContactType',
              'contacttype:update': 'Editar ContactType',
              'contacttype:delete': 'Eliminar ContactType',
              'contacttype:manage': 'Gestionar ContactType',
     }
  }
}

export default messages;  
