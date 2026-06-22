
const messages = {
  en: {
  
    agentjob: {
          entity: 'Agent Job',
          menu: 'Agent Jobs',
          crud: 'Manage Agent Job',
          field:{
                       name:'Name',
           description:'Description',
           active:'Active',
           agent:'Agent',
           systemPrompt: 'System Prompt',
           allowedTools: 'Allowed Tools',
           schedule:'Schedule',
           type: 'Type',
           timezone: 'Time Zone',
           runAt: 'Run At',
           time: 'Time',
           daysOfWeek: 'Days of Week',
           daysOfMonth: 'Days of Month',
           interval: 'Interval',
           cronExpression: 'Cron Expression',
           execution:'Execution',
           timeoutSeconds: 'Timeout (seconds)',
           maxRetries: 'Max Retries',
           runtime:'Runtime',
           lastRunAt: 'Last Run At',
           nextRunAt: 'Next Run At',
           lastStatus: 'Last Status',
           createdBy:'Created By'
          }
      },
      permission: {
              'agentjob:view': 'View Agent Job',
              'agentjob:create': 'Create Agent Job',
              'agentjob:update': 'Edit Agent Job',
              'agentjob:delete': 'Delete Agent Job',
              'agentjob:manage': 'Manage Agent Job',
      }
  },
  es: {
     agentjob: {
          entity: 'Trabajo de agente',
          menu: 'Trabajos de agente',
          crud: 'Gestionar trabajo de agente',
          field:{
                       name:'Nombre',
           description:'Descripción',
           active:'Activo',
           agent:'Agente',
           systemPrompt: 'Prompt del sistema',
           allowedTools: 'Herramientas permitidas',
           schedule:'Programación',
           type: 'Tipo',
           timezone: 'Zona horaria',
           runAt: 'Ejecutar el',
           time: 'Hora',
           daysOfWeek: 'Días de la semana',
           daysOfMonth: 'Días del mes',
           interval: 'Intervalo',
           cronExpression: 'Expresión cron',
           execution:'Ejecución',
           timeoutSeconds: 'Tiempo máximo (segundos)',
           maxRetries: 'Reintentos máximos',
           runtime:'Entorno de ejecución',
           lastRunAt: 'Última ejecución',
           nextRunAt: 'Próxima ejecución',
           lastStatus: 'Último estado',
           createdBy:'Creado por'
          }
      },
     permission: {
              'agentjob:view': 'Ver trabajo de agente',
              'agentjob:create': 'Crear trabajo de agente',
              'agentjob:update': 'Editar trabajo de agente',
              'agentjob:delete': 'Eliminar trabajo de agente',
              'agentjob:manage': 'Gestionar trabajo de agente',
     }
  }
}

export default messages;  
