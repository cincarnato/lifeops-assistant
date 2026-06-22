
const messages = {
  en: {
  
    priority: {
          entity: 'Priority',
          menu: 'Priorities',
          crud: 'Manage Priority',
          field:{
                       name:'Name',
           description:'Description',
           color:'Color'
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
          entity: 'Prioridad',
          menu: 'Prioridades',
          crud: 'Gestionar prioridad',
          field:{
                       name:'Nombre',
           description:'Descripción',
           color:'Color'
          }
      },
     permission: {
              'priority:view': 'Ver prioridad',
              'priority:create': 'Crear prioridad',
              'priority:update': 'Editar prioridad',
              'priority:delete': 'Eliminar prioridad',
              'priority:manage': 'Gestionar prioridad',
     }
  }
}

export default messages;  
