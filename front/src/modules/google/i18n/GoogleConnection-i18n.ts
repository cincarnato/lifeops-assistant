
const messages = {
  en: {
  
    googleconnection: {
          entity: 'Google Connection',
          menu: 'Google Connections',
          crud: 'Manage Google Connections',
          field:{
                       userId:'User',
           provider:'Provider',
           googleEmail:'Google Email',
           googleUserId:'Google User ID',
           accessToken:'Access Token',
           refreshToken:'Refresh Token',
           scope:'Scopes',
           expiryDate:'Expiry Date',
           status:'Status',
           lastUsedAt:'Last Used At',
           connectedAt:'Connected At',
           updatedAt:'Updated At'
          }
      },
      permission: {
              'googleconnection:view': 'View Google Connection',
              'googleconnection:create': 'Create Google Connection',
              'googleconnection:update': 'Edit Google Connection',
              'googleconnection:delete': 'Delete Google Connection',
              'googleconnection:manage': 'Manage Google Connections',
      }
  },
  es: {
     googleconnection: {
          entity: 'Conexion de Google',
          menu: 'Conexiones de Google',
          crud: 'Gestionar conexiones de Google',
          field:{
                       userId:'Usuario',
           provider:'Proveedor',
           googleEmail:'Email de Google',
           googleUserId:'ID de usuario Google',
           accessToken:'Access Token',
           refreshToken:'Refresh Token',
           scope:'Permisos',
           expiryDate:'Fecha de expiracion',
           status:'Estado',
           lastUsedAt:'Ultimo uso',
           connectedAt:'Fecha de conexion',
           updatedAt:'Fecha de actualizacion'
          }
      },
     permission: {
              'googleconnection:view': 'Ver conexion de Google',
              'googleconnection:create': 'Crear conexion de Google',
              'googleconnection:update': 'Editar conexion de Google',
              'googleconnection:delete': 'Eliminar conexion de Google',
              'googleconnection:manage': 'Gestionar conexiones de Google',
     }
  }
}

export default messages;  
