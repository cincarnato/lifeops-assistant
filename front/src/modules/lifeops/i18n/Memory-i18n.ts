
const messages = {
  en: {
  
    memory: {
          entity: 'Memory',
          menu: 'Memories',
          crud: 'Manage Memory',
          field:{
                       title:'Title',
           content:'Content',
           type:'Type',
           tags:'Tags',
           importance:'Importance',
           source:'Source'
          }
      },
      permission: {
              'memory:view': 'View Memory',
              'memory:create': 'Create Memory',
              'memory:update': 'Edit Memory',
              'memory:delete': 'Delete Memory',
              'memory:manage': 'Manage Memory',
      }
  },
  es: {
     memory: {
          entity: 'Memoria',
          menu: 'Memorias',
          crud: 'Gestionar memoria',
          field:{
                       title:'Título',
           content:'Contenido',
           type:'Tipo',
           tags:'Etiquetas',
           importance:'Importancia',
           source:'Origen'
          }
      },
     permission: {
              'memory:view': 'Ver memoria',
              'memory:create': 'Crear memoria',
              'memory:update': 'Editar memoria',
              'memory:delete': 'Eliminar memoria',
              'memory:manage': 'Gestionar memoria',
     }
  }
}

export default messages;  
