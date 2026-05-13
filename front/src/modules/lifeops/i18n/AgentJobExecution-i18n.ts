
const messages = {
  en: {
  
    agentjobexecution: {
          entity: 'AgentJobExecution',
          menu: 'AgentJobExecution',
          crud: 'Manage AgentJobExecution',
          field:{
                       jobId:'jobId',
           status:'status',
           trigger:'trigger',
           scheduledFor:'scheduledFor',
           startedAt:'startedAt',
           finishedAt:'finishedAt',
           durationMs:'durationMs',
           attempt:'attempt',
           promptSnapshot:'promptSnapshot',
           systemPrompt: 'systemPrompt',
           allowedTools: 'allowedTools',
           result:'result',
           summary: 'summary',
           actions: 'actions',
           data: 'data',
           outcome: 'outcome',
           toolCalls:'toolCalls',
           name: 'name',
           input: 'input',
           output: 'output',
           errorMessage: 'errorMessage',
           error:'error',
           code: 'code',
           message: 'message',
           usage:'usage',
           model: 'model',
           inputTokens: 'inputTokens',
           outputTokens: 'outputTokens',
           totalTokens: 'totalTokens'
          }
      },
      permission: {
              'agentjobexecution:view': 'View AgentJobExecution',
              'agentjobexecution:create': 'Create AgentJobExecution',
              'agentjobexecution:update': 'Edit AgentJobExecution',
              'agentjobexecution:delete': 'Delete AgentJobExecution',
              'agentjobexecution:manage': 'Manage AgentJobExecution',
      }
  },
  es: {
     agentjobexecution: {
          entity: 'AgentJobExecution',
          menu: 'AgentJobExecution',
          crud: 'Gestionar AgentJobExecution',
          field:{
                       jobId:'jobId',
           status:'status',
           trigger:'trigger',
           scheduledFor:'scheduledFor',
           startedAt:'startedAt',
           finishedAt:'finishedAt',
           durationMs:'durationMs',
           attempt:'attempt',
           promptSnapshot:'promptSnapshot',
           systemPrompt: 'systemPrompt',
           allowedTools: 'allowedTools',
           result:'result',
           summary: 'summary',
           actions: 'actions',
           data: 'data',
           outcome: 'outcome',
           toolCalls:'toolCalls',
           name: 'name',
           input: 'input',
           output: 'output',
           errorMessage: 'errorMessage',
           error:'error',
           code: 'code',
           message: 'message',
           usage:'usage',
           model: 'model',
           inputTokens: 'inputTokens',
           outputTokens: 'outputTokens',
           totalTokens: 'totalTokens'
          }
      },
     permission: {
              'agentjobexecution:view': 'Ver AgentJobExecution',
              'agentjobexecution:create': 'Crear AgentJobExecution',
              'agentjobexecution:update': 'Editar AgentJobExecution',
              'agentjobexecution:delete': 'Eliminar AgentJobExecution',
              'agentjobexecution:manage': 'Gestionar AgentJobExecution',
     }
  }
}

export default messages;  
