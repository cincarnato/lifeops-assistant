
const messages = {
  en: {
  
    dayplan: {
          entity: 'DayPlan',
          menu: 'DayPlan',
          crud: 'Manage DayPlan',
          field:{
           date:'date',
           user:'user',
           status:'status',
           events:'events',
           googleEventId: 'googleEventId',
           title: 'title',
           description: 'description',
           startAt: 'startAt',
           endAt: 'endAt',
           decision: 'decision',
           tasks:'tasks',
           task: 'task',
           habits:'habits',
           habit: 'habit',
           suggestions:'suggestions',
           goal: 'goal',
           project: 'project'
          },
          ui: {
           totalItems: 'Items',
           committedItems: 'Committed',
           empty: 'There are no planned items for this day.',
           noEvents: 'No events.',
           noTasks: 'No tasks.',
           noHabits: 'No habits.',
           noSuggestions: 'No suggestions.'
          }
      },
      permission: {
              'dayplan:view': 'View DayPlan',
              'dayplan:create': 'Create DayPlan',
              'dayplan:update': 'Edit DayPlan',
              'dayplan:delete': 'Delete DayPlan',
              'dayplan:manage': 'Manage DayPlan',
      }
  },
  es: {
     dayplan: {
          entity: 'Plan diario',
          menu: 'Plan diario',
          crud: 'Gestionar plan diario',
          field:{
           date:'fecha',
           user:'usuario',
           status:'estado',
           events:'eventos',
           googleEventId: 'evento de Google',
           title: 'titulo',
           description: 'descripcion',
           startAt: 'inicio',
           endAt: 'fin',
           decision: 'decision',
           tasks:'tareas',
           task: 'tarea',
           habits:'habitos',
           habit: 'habito',
           suggestions:'sugerencias',
           goal: 'objetivo',
           project: 'proyecto'
          },
          ui: {
           totalItems: 'Items',
           committedItems: 'Comprometidos',
           empty: 'No hay items planificados para este dia.',
           noEvents: 'Sin eventos.',
           noTasks: 'Sin tareas.',
           noHabits: 'Sin habitos.',
           noSuggestions: 'Sin sugerencias.'
          }
      },
     permission: {
              'dayplan:view': 'Ver DayPlan',
              'dayplan:create': 'Crear DayPlan',
              'dayplan:update': 'Editar DayPlan',
              'dayplan:delete': 'Eliminar DayPlan',
              'dayplan:manage': 'Gestionar DayPlan',
     }
  }
}

export default messages;  
