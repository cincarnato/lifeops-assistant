
const messages = {
  en: {
  
    clienttype: {
          entity: 'ClientType',
          menu: 'ClientType',
          crud: 'Manage ClientType',
          field:{
                       name:'name',
           description:'description'
          }
      },
      permission: {
              'clienttype:view': 'View ClientType',
              'clienttype:create': 'Create ClientType',
              'clienttype:update': 'Edit ClientType',
              'clienttype:delete': 'Delete ClientType',
              'clienttype:manage': 'Manage ClientType',
      }
  },
  es: {
     clienttype: {
          entity: 'ClientType',
          menu: 'ClientType',
          crud: 'Gestionar ClientType',
          field:{
                       name:'name',
           description:'description'
          }
      },
     permission: {
              'clienttype:view': 'Ver ClientType',
              'clienttype:create': 'Crear ClientType',
              'clienttype:update': 'Editar ClientType',
              'clienttype:delete': 'Eliminar ClientType',
              'clienttype:manage': 'Gestionar ClientType',
     }
  }
}

export default messages;  
