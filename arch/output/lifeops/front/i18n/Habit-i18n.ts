
const messages = {
  en: {
  
    habit: {
          entity: 'Habit',
          menu: 'Habit',
          crud: 'Manage Habit',
          field:{
                       name:'name',
           description:'description',
           lifeArea:'lifeArea',
           active:'active',
           frequency:'frequency',
           type: 'type',
           generateTask:'generateTask',
           taskTemplate:'taskTemplate',
           title: 'title',
           description: 'description',
           estimatedMinutes: 'estimatedMinutes',
           priority: 'priority'
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
          entity: 'Habit',
          menu: 'Habit',
          crud: 'Gestionar Habit',
          field:{
                       name:'name',
           description:'description',
           lifeArea:'lifeArea',
           active:'active',
           frequency:'frequency',
           type: 'type',
           generateTask:'generateTask',
           taskTemplate:'taskTemplate',
           title: 'title',
           description: 'description',
           estimatedMinutes: 'estimatedMinutes',
           priority: 'priority'
          }
      },
     permission: {
              'habit:view': 'Ver Habit',
              'habit:create': 'Crear Habit',
              'habit:update': 'Editar Habit',
              'habit:delete': 'Eliminar Habit',
              'habit:manage': 'Gestionar Habit',
     }
  }
}

export default messages;  
