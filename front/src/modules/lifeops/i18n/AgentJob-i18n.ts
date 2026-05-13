
const messages = {
  en: {
  
    agentjob: {
          entity: 'AgentJob',
          menu: 'AgentJob',
          crud: 'Manage AgentJob',
          field:{
                       name:'name',
           description:'description',
           active:'active',
           agent:'agent',
           systemPrompt: 'systemPrompt',
           allowedTools: 'allowedTools',
           schedule:'schedule',
           type: 'type',
           timezone: 'timezone',
           runAt: 'runAt',
           time: 'time',
           daysOfWeek: 'daysOfWeek',
           daysOfMonth: 'daysOfMonth',
           interval: 'interval',
           cronExpression: 'cronExpression',
           execution:'execution',
           timeoutSeconds: 'timeoutSeconds',
           maxRetries: 'maxRetries',
           runtime:'runtime',
           lastRunAt: 'lastRunAt',
           nextRunAt: 'nextRunAt',
           lastStatus: 'lastStatus',
           createdBy:'createdBy'
          }
      },
      permission: {
              'agentjob:view': 'View AgentJob',
              'agentjob:create': 'Create AgentJob',
              'agentjob:update': 'Edit AgentJob',
              'agentjob:delete': 'Delete AgentJob',
              'agentjob:manage': 'Manage AgentJob',
      }
  },
  es: {
     agentjob: {
          entity: 'AgentJob',
          menu: 'AgentJob',
          crud: 'Gestionar AgentJob',
          field:{
                       name:'name',
           description:'description',
           active:'active',
           agent:'agent',
           systemPrompt: 'systemPrompt',
           allowedTools: 'allowedTools',
           schedule:'schedule',
           type: 'type',
           timezone: 'timezone',
           runAt: 'runAt',
           time: 'time',
           daysOfWeek: 'daysOfWeek',
           daysOfMonth: 'daysOfMonth',
           interval: 'interval',
           cronExpression: 'cronExpression',
           execution:'execution',
           timeoutSeconds: 'timeoutSeconds',
           maxRetries: 'maxRetries',
           runtime:'runtime',
           lastRunAt: 'lastRunAt',
           nextRunAt: 'nextRunAt',
           lastStatus: 'lastStatus',
           createdBy:'createdBy'
          }
      },
     permission: {
              'agentjob:view': 'Ver AgentJob',
              'agentjob:create': 'Crear AgentJob',
              'agentjob:update': 'Editar AgentJob',
              'agentjob:delete': 'Eliminar AgentJob',
              'agentjob:manage': 'Gestionar AgentJob',
     }
  }
}

export default messages;  
