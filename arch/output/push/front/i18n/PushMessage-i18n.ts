
const messages = {
  en: {
  
    pushmessage: {
          entity: 'PushMessage',
          menu: 'PushMessage',
          crud: 'Manage PushMessage',
          field:{
                       user:'user',
           title:'title',
           body:'body',
           status:'status',
           providerMessageId:'providerMessageId',
           type:'type',
           errorMessage:'errorMessage',
           sentAt:'sentAt'
          }
      },
      permission: {
              'pushmessage:view': 'View PushMessage',
              'pushmessage:create': 'Create PushMessage',
              'pushmessage:update': 'Edit PushMessage',
              'pushmessage:delete': 'Delete PushMessage',
              'pushmessage:manage': 'Manage PushMessage',
      }
  },
  es: {
     pushmessage: {
          entity: 'PushMessage',
          menu: 'PushMessage',
          crud: 'Gestionar PushMessage',
          field:{
                       user:'user',
           title:'title',
           body:'body',
           status:'status',
           providerMessageId:'providerMessageId',
           type:'type',
           errorMessage:'errorMessage',
           sentAt:'sentAt'
          }
      },
     permission: {
              'pushmessage:view': 'Ver PushMessage',
              'pushmessage:create': 'Crear PushMessage',
              'pushmessage:update': 'Editar PushMessage',
              'pushmessage:delete': 'Eliminar PushMessage',
              'pushmessage:manage': 'Gestionar PushMessage',
     }
  }
}

export default messages;  
