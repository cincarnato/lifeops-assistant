
const messages = {
  en: {
  
    taskpriority: {
          entity: 'TaskPriority',
          menu: 'TaskPriority',
          crud: 'Manage TaskPriority',
          field:{
                       name:'name',
           description:'description'
          }
      },
      permission: {
              'taskpriority:view': 'View TaskPriority',
              'taskpriority:create': 'Create TaskPriority',
              'taskpriority:update': 'Edit TaskPriority',
              'taskpriority:delete': 'Delete TaskPriority',
              'taskpriority:manage': 'Manage TaskPriority',
      }
  },
  es: {
     taskpriority: {
          entity: 'TaskPriority',
          menu: 'TaskPriority',
          crud: 'Gestionar TaskPriority',
          field:{
                       name:'name',
           description:'description'
          }
      },
     permission: {
              'taskpriority:view': 'Ver TaskPriority',
              'taskpriority:create': 'Crear TaskPriority',
              'taskpriority:update': 'Editar TaskPriority',
              'taskpriority:delete': 'Eliminar TaskPriority',
              'taskpriority:manage': 'Gestionar TaskPriority',
     }
  }
}

export default messages;  
