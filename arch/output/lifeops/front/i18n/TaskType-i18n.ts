
const messages = {
  en: {
  
    tasktype: {
          entity: 'TaskType',
          menu: 'TaskType',
          crud: 'Manage TaskType',
          field:{
                       name:'name',
           description:'description'
          }
      },
      permission: {
              'tasktype:view': 'View TaskType',
              'tasktype:create': 'Create TaskType',
              'tasktype:update': 'Edit TaskType',
              'tasktype:delete': 'Delete TaskType',
              'tasktype:manage': 'Manage TaskType',
      }
  },
  es: {
     tasktype: {
          entity: 'TaskType',
          menu: 'TaskType',
          crud: 'Gestionar TaskType',
          field:{
                       name:'name',
           description:'description'
          }
      },
     permission: {
              'tasktype:view': 'Ver TaskType',
              'tasktype:create': 'Crear TaskType',
              'tasktype:update': 'Editar TaskType',
              'tasktype:delete': 'Eliminar TaskType',
              'tasktype:manage': 'Gestionar TaskType',
     }
  }
}

export default messages;  
