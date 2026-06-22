
const messages = {
  en: {
  
    agentjobexecution: {
          entity: 'Agent Job Execution',
          menu: 'Agent Job Executions',
          crud: 'Manage Agent Job Execution',
          field:{
                       jobId:'Job',
           status:'Status',
           trigger:'Trigger',
           scheduledFor:'Scheduled For',
           startedAt:'Started At',
           finishedAt:'Finished At',
           durationMs:'Duration (ms)',
           attempt:'Attempt',
           promptSnapshot:'Prompt Snapshot',
           systemPrompt: 'System Prompt',
           allowedTools: 'Allowed Tools',
           result:'Result',
           summary: 'Summary',
           actions: 'Actions',
           data: 'Data',
           outcome: 'Outcome',
           toolCalls:'Tool Calls',
           name: 'Name',
           input: 'Input',
           output: 'Output',
           errorMessage: 'Error Message',
           error:'Error',
           code: 'Code',
           message: 'Message',
           usage:'Usage',
           model: 'Model',
           inputTokens: 'Input Tokens',
           outputTokens: 'Output Tokens',
           totalTokens: 'Total Tokens'
          }
      },
      permission: {
              'agentjobexecution:view': 'View Agent Job Execution',
              'agentjobexecution:create': 'Create Agent Job Execution',
              'agentjobexecution:update': 'Edit Agent Job Execution',
              'agentjobexecution:delete': 'Delete Agent Job Execution',
              'agentjobexecution:manage': 'Manage Agent Job Execution',
      }
  },
  es: {
     agentjobexecution: {
          entity: 'Ejecución de trabajo de agente',
          menu: 'Ejecuciones de trabajos de agente',
          crud: 'Gestionar ejecución de trabajo de agente',
          field:{
                       jobId:'Trabajo',
           status:'Estado',
           trigger:'Disparador',
           scheduledFor:'Programada para',
           startedAt:'Iniciada el',
           finishedAt:'Finalizada el',
           durationMs:'Duración (ms)',
           attempt:'Intento',
           promptSnapshot:'Copia del prompt',
           systemPrompt: 'Prompt del sistema',
           allowedTools: 'Herramientas permitidas',
           result:'Resultado',
           summary: 'Resumen',
           actions: 'Acciones',
           data: 'Datos',
           outcome: 'Resultado final',
           toolCalls:'Llamadas a herramientas',
           name: 'Nombre',
           input: 'Entrada',
           output: 'Salida',
           errorMessage: 'Mensaje de error',
           error:'Error',
           code: 'Código',
           message: 'Mensaje',
           usage:'Uso',
           model: 'Modelo',
           inputTokens: 'Tokens de entrada',
           outputTokens: 'Tokens de salida',
           totalTokens: 'Tokens totales'
          }
      },
     permission: {
              'agentjobexecution:view': 'Ver ejecución de trabajo de agente',
              'agentjobexecution:create': 'Crear ejecución de trabajo de agente',
              'agentjobexecution:update': 'Editar ejecución de trabajo de agente',
              'agentjobexecution:delete': 'Eliminar ejecución de trabajo de agente',
              'agentjobexecution:manage': 'Gestionar ejecución de trabajo de agente',
     }
  }
}

export default messages;  
