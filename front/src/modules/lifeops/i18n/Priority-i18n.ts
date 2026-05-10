
const messages = {
  en: {
  
    priority: {
          entity: 'Priority',
          menu: 'Priority',
          crud: 'Manage Priority',
          field:{
                       name:'name',
           description:'description',
           color:'color'
          }
      },
      permission: {
              'priority:view': 'View Priority',
              'priority:create': 'Create Priority',
              'priority:update': 'Edit Priority',
              'priority:delete': 'Delete Priority',
              'priority:manage': 'Manage Priority',
      }
  },
  es: {
     priority: {
          entity: 'Priority',
          menu: 'Priority',
          crud: 'Gestionar Priority',
          field:{
                       name:'name',
           description:'description',
           color:'color'
          }
      },
     permission: {
              'priority:view': 'Ver Priority',
              'priority:create': 'Crear Priority',
              'priority:update': 'Editar Priority',
              'priority:delete': 'Eliminar Priority',
              'priority:manage': 'Gestionar Priority',
     }
  }
}

export default messages;  
