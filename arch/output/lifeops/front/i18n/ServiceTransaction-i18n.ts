
const messages = {
  en: {

    servicetransaction: {
          entity: 'ServiceTransaction',
          menu: 'ServiceTransaction',
          crud: 'ServiceTransaction',
          field:{
                       service:'service',
           period:'period',
           amount:'amount',
           status:'status',
           paidAt:'paidAt'
          },
          tabs: {

          }
      },
      permission: {
              'servicetransaction:view': 'View ServiceTransaction',
              'servicetransaction:create': 'Create ServiceTransaction',
              'servicetransaction:update': 'Edit ServiceTransaction',
              'servicetransaction:delete': 'Delete ServiceTransaction',
              'servicetransaction:manage': 'Manage ServiceTransaction',
      }
  },
  es: {
     servicetransaction: {
          entity: 'ServiceTransaction',
          menu: 'ServiceTransaction',
          crud: 'ServiceTransaction',
          field:{
                       service:'service',
           period:'period',
           amount:'amount',
           status:'status',
           paidAt:'paidAt'
          },
          tabs: {

          }
      },
     permission: {
              'servicetransaction:view': 'Ver ServiceTransaction',
              'servicetransaction:create': 'Crear ServiceTransaction',
              'servicetransaction:update': 'Editar ServiceTransaction',
              'servicetransaction:delete': 'Eliminar ServiceTransaction',
              'servicetransaction:manage': 'Gestionar ServiceTransaction',
     }
  }
}

export default messages;
