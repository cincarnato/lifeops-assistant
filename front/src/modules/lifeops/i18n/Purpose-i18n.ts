
const messages = {
  en: {
  
    purpose: {
          entity: 'Purpose',
          menu: 'Purposes',
          crud: 'Manage Purpose',
          field:{
                       title:'Title',
           statement:'Statement',
           isPrimary:'Primary',
           active:'Active'
          }
      },
      permission: {
              'purpose:view': 'View Purpose',
              'purpose:create': 'Create Purpose',
              'purpose:update': 'Edit Purpose',
              'purpose:delete': 'Delete Purpose',
              'purpose:manage': 'Manage Purpose',
      }
  },
  es: {
     purpose: {
          entity: 'Propósito',
          menu: 'Propósitos',
          crud: 'Gestionar propósito',
          field:{
                       title:'Título',
           statement:'Declaración',
           isPrimary:'Principal',
           active:'Activo'
          }
      },
     permission: {
              'purpose:view': 'Ver propósito',
              'purpose:create': 'Crear propósito',
              'purpose:update': 'Editar propósito',
              'purpose:delete': 'Eliminar propósito',
              'purpose:manage': 'Gestionar propósito',
     }
  }
}

export default messages;  
