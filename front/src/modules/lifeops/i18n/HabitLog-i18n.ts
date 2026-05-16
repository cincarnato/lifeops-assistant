
const messages = {
  en: {
  
    habitlog: {
          entity: 'HabitLog',
          menu: 'HabitLog',
          crud: 'Manage HabitLog',
          field:{
                       habit:'habit',
           date:'date',
           task:'task'
          }
      },
      permission: {
              'habitlog:view': 'View HabitLog',
              'habitlog:create': 'Create HabitLog',
              'habitlog:update': 'Edit HabitLog',
              'habitlog:delete': 'Delete HabitLog',
              'habitlog:manage': 'Manage HabitLog',
      }
  },
  es: {
     habitlog: {
          entity: 'HabitLog',
          menu: 'HabitLog',
          crud: 'Gestionar HabitLog',
          field:{
                       habit:'habit',
           date:'date',
           task:'task'
          }
      },
     permission: {
              'habitlog:view': 'Ver HabitLog',
              'habitlog:create': 'Crear HabitLog',
              'habitlog:update': 'Editar HabitLog',
              'habitlog:delete': 'Eliminar HabitLog',
              'habitlog:manage': 'Gestionar HabitLog',
     }
  }
}

export default messages;  
