
const messages = {
  en: {
  
    task: {
          entity: 'Task',
          menu: 'Task',
          crud: 'Manage Task',
          field:{
                       title:'title',
           description:'description',
           source:'source',
           type:'type',
           status:'status',
           priority:'priority',
           goals:'goals',
           project:'project',
           client:'client',
           contacts:'contacts',
           valueScore:'valueScore',
           motivationScore:'motivationScore',
           effortScore:'effortScore',
           urgencyScore:'urgencyScore',
           dueDate:'dueDate',
           scheduledDate:'scheduledDate',
           completedAt:'completedAt',
           estimatedMinutes:'estimatedMinutes',
           spentMinutes:'spentMinutes',
           nextAction:'nextAction',
           redmineIssueId:'redmineIssueId',
           emailMessageId:'emailMessageId',
           calendarEventId:'calendarEventId',
           tags:'tags',
           notes:'notes',
           user:'user',
           archivedAt:'archivedAt'
          }
      },
      permission: {
              'task:view': 'View Task',
              'task:create': 'Create Task',
              'task:update': 'Edit Task',
              'task:delete': 'Delete Task',
              'task:manage': 'Manage Task',
      }
  },
  es: {
     task: {
          entity: 'Task',
          menu: 'Task',
          crud: 'Gestionar Task',
          field:{
                       title:'title',
           description:'description',
           source:'source',
           type:'type',
           status:'status',
           priority:'priority',
           goals:'goals',
           project:'project',
           client:'client',
           contacts:'contacts',
           valueScore:'valueScore',
           motivationScore:'motivationScore',
           effortScore:'effortScore',
           urgencyScore:'urgencyScore',
           dueDate:'dueDate',
           scheduledDate:'scheduledDate',
           completedAt:'completedAt',
           estimatedMinutes:'estimatedMinutes',
           spentMinutes:'spentMinutes',
           nextAction:'nextAction',
           redmineIssueId:'redmineIssueId',
           emailMessageId:'emailMessageId',
           calendarEventId:'calendarEventId',
           tags:'tags',
           notes:'notes',
           user:'user',
           archivedAt:'archivedAt'
          }
      },
     permission: {
              'task:view': 'Ver Task',
              'task:create': 'Crear Task',
              'task:update': 'Editar Task',
              'task:delete': 'Eliminar Task',
              'task:manage': 'Gestionar Task',
     }
  }
}

export default messages;  
