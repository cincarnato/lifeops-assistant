
const messages = {
  en: {
  
    googleconnection: {
          entity: 'GoogleConnection',
          menu: 'GoogleConnection',
          crud: 'Manage GoogleConnection',
          field:{
                       userId:'userId',
           provider:'provider',
           googleEmail:'googleEmail',
           googleUserId:'googleUserId',
           accessToken:'accessToken',
           refreshToken:'refreshToken',
           scope:'scope',
           expiryDate:'expiryDate',
           status:'status',
           lastUsedAt:'lastUsedAt',
           connectedAt:'connectedAt'
          }
      },
      permission: {
              'googleconnection:view': 'View GoogleConnection',
              'googleconnection:create': 'Create GoogleConnection',
              'googleconnection:update': 'Edit GoogleConnection',
              'googleconnection:delete': 'Delete GoogleConnection',
              'googleconnection:manage': 'Manage GoogleConnection',
      }
  },
  es: {
     googleconnection: {
          entity: 'GoogleConnection',
          menu: 'GoogleConnection',
          crud: 'Gestionar GoogleConnection',
          field:{
                       userId:'userId',
           provider:'provider',
           googleEmail:'googleEmail',
           googleUserId:'googleUserId',
           accessToken:'accessToken',
           refreshToken:'refreshToken',
           scope:'scope',
           expiryDate:'expiryDate',
           status:'status',
           lastUsedAt:'lastUsedAt',
           connectedAt:'connectedAt'
          }
      },
     permission: {
              'googleconnection:view': 'Ver GoogleConnection',
              'googleconnection:create': 'Crear GoogleConnection',
              'googleconnection:update': 'Editar GoogleConnection',
              'googleconnection:delete': 'Eliminar GoogleConnection',
              'googleconnection:manage': 'Gestionar GoogleConnection',
     }
  }
}

export default messages;  
