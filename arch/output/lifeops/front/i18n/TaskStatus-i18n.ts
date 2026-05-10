
const messages = {
  en: {
  
    taskstatus: {
          entity: 'TaskStatus',
          menu: 'TaskStatus',
          crud: 'Manage TaskStatus',
          field:{
                       name:'name',
           description:'description'
          }
      },
      permission: {
              'taskstatus:view': 'View TaskStatus',
              'taskstatus:create': 'Create TaskStatus',
              'taskstatus:update': 'Edit TaskStatus',
              'taskstatus:delete': 'Delete TaskStatus',
              'taskstatus:manage': 'Manage TaskStatus',
      }
  },
  es: {
     taskstatus: {
          entity: 'TaskStatus',
          menu: 'TaskStatus',
          crud: 'Gestionar TaskStatus',
          field:{
                       name:'name',
           description:'description'
          }
      },
     permission: {
              'taskstatus:view': 'Ver TaskStatus',
              'taskstatus:create': 'Crear TaskStatus',
              'taskstatus:update': 'Editar TaskStatus',
              'taskstatus:delete': 'Eliminar TaskStatus',
              'taskstatus:manage': 'Gestionar TaskStatus',
     }
  }
}

export default messages;  
