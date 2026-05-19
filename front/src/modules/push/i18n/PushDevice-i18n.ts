
const messages = {
  en: {
  
    pushdevice: {
          entity: 'PushDevice',
          menu: 'PushDevice',
          crud: 'Manage PushDevice',
          field:{
                       user:'user',
           platform:'platform',
           token:'token',
           deviceName:'deviceName',
           enabled:'enabled',
           lastSeenAt:'lastSeenAt'
          }
      },
      permission: {
              'pushdevice:view': 'View PushDevice',
              'pushdevice:create': 'Create PushDevice',
              'pushdevice:update': 'Edit PushDevice',
              'pushdevice:delete': 'Delete PushDevice',
              'pushdevice:manage': 'Manage PushDevice',
      }
  },
  es: {
     pushdevice: {
          entity: 'PushDevice',
          menu: 'PushDevice',
          crud: 'Gestionar PushDevice',
          field:{
                       user:'user',
           platform:'platform',
           token:'token',
           deviceName:'deviceName',
           enabled:'enabled',
           lastSeenAt:'lastSeenAt'
          }
      },
     permission: {
              'pushdevice:view': 'Ver PushDevice',
              'pushdevice:create': 'Crear PushDevice',
              'pushdevice:update': 'Editar PushDevice',
              'pushdevice:delete': 'Eliminar PushDevice',
              'pushdevice:manage': 'Gestionar PushDevice',
     }
  }
}

export default messages;  
