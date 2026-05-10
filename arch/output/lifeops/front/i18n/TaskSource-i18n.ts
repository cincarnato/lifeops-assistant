
const messages = {
  en: {
  
    tasksource: {
          entity: 'TaskSource',
          menu: 'TaskSource',
          crud: 'Manage TaskSource',
          field:{
                       name:'name',
           description:'description'
          }
      },
      permission: {
              'tasksource:view': 'View TaskSource',
              'tasksource:create': 'Create TaskSource',
              'tasksource:update': 'Edit TaskSource',
              'tasksource:delete': 'Delete TaskSource',
              'tasksource:manage': 'Manage TaskSource',
      }
  },
  es: {
     tasksource: {
          entity: 'TaskSource',
          menu: 'TaskSource',
          crud: 'Gestionar TaskSource',
          field:{
                       name:'name',
           description:'description'
          }
      },
     permission: {
              'tasksource:view': 'Ver TaskSource',
              'tasksource:create': 'Crear TaskSource',
              'tasksource:update': 'Editar TaskSource',
              'tasksource:delete': 'Eliminar TaskSource',
              'tasksource:manage': 'Gestionar TaskSource',
     }
  }
}

export default messages;  
