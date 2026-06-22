
const messages = {
  en: {
  
    habitlog: {
          entity: 'Habit Log',
          menu: 'Habit Logs',
          crud: 'Manage Habit Log',
          field:{
                       habit:'Habit',
           date:'Date',
           task:'Task'
          }
      },
      permission: {
              'habitlog:view': 'View Habit Log',
              'habitlog:create': 'Create Habit Log',
              'habitlog:update': 'Edit Habit Log',
              'habitlog:delete': 'Delete Habit Log',
              'habitlog:manage': 'Manage Habit Log',
      }
  },
  es: {
     habitlog: {
          entity: 'Registro de hábito',
          menu: 'Registros de hábitos',
          crud: 'Gestionar registro de hábito',
          field:{
                       habit:'Hábito',
           date:'Fecha',
           task:'Tarea'
          }
      },
     permission: {
              'habitlog:view': 'Ver registro de hábito',
              'habitlog:create': 'Crear registro de hábito',
              'habitlog:update': 'Editar registro de hábito',
              'habitlog:delete': 'Eliminar registro de hábito',
              'habitlog:manage': 'Gestionar registro de hábito',
     }
  }
}

export default messages;  
