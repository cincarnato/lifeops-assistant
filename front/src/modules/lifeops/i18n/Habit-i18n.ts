
const messages = {
  en: {
  
    habit: {
          entity: 'Habit',
          menu: 'Habits',
          crud: 'Manage Habit',
          field:{
                       name:'Name',
           description:'Description',
           lifeArea:'Life Area',
           active:'Active',
           frequency:'Frequency',
           type: 'Type',
           generateTask:'Generate Task',
           taskTemplate:'Task Template',
           title: 'Title',
           estimatedMinutes: 'Estimated Minutes',
           priority: 'Priority'
          }
      },
      permission: {
              'habit:view': 'View Habit',
              'habit:create': 'Create Habit',
              'habit:update': 'Edit Habit',
              'habit:delete': 'Delete Habit',
              'habit:manage': 'Manage Habit',
      }
  },
  es: {
     habit: {
          entity: 'Hábito',
          menu: 'Hábitos',
          crud: 'Gestionar hábito',
          field:{
                       name:'Nombre',
           description:'Descripción',
           lifeArea:'Área de vida',
           active:'Activo',
           frequency:'Frecuencia',
           type: 'Tipo',
           generateTask:'Generar tarea',
           taskTemplate:'Plantilla de tarea',
           title: 'Título',
           estimatedMinutes: 'Minutos estimados',
           priority: 'Prioridad'
          }
      },
     permission: {
              'habit:view': 'Ver hábito',
              'habit:create': 'Crear hábito',
              'habit:update': 'Editar hábito',
              'habit:delete': 'Eliminar hábito',
              'habit:manage': 'Gestionar hábito',
     }
  }
}

export default messages;  
