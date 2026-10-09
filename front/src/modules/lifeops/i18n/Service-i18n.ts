const messages = {
  en: {
    service: {
      entity: 'Service',
      menu: 'Services',
      crud: 'Manage services',
      field: {
        name: 'Name', businessPartner: 'Business partner', type: 'Type',
        amount: 'Amount', frequency: 'Frequency', active: 'Active'
      },
      type: {INCOME: 'Income', EXPENSE: 'Expense'},
      frequency: {
        MONTHLY: 'Monthly', BIMONTHLY: 'Every two months', QUARTERLY: 'Quarterly',
        YEARLY: 'Yearly', ON_DEMAND: 'On demand'
      },
      validation: {amount: 'Enter an amount greater than or equal to zero'}
    },
    permission: {
      'service:view': 'View services', 'service:create': 'Create services',
      'service:update': 'Edit services', 'service:delete': 'Delete services',
      'service:manage': 'Manage services'
    }
  },
  es: {
    service: {
      entity: 'Servicio',
      menu: 'Servicios',
      crud: 'Gestionar servicios',
      field: {
        name: 'Nombre', businessPartner: 'Socio comercial', type: 'Tipo',
        amount: 'Importe', frequency: 'Frecuencia', active: 'Activo'
      },
      type: {INCOME: 'Ingreso', EXPENSE: 'Gasto'},
      frequency: {
        MONTHLY: 'Mensual', BIMONTHLY: 'Cada dos meses', QUARTERLY: 'Trimestral',
        YEARLY: 'Anual', ON_DEMAND: 'Bajo demanda'
      },
      validation: {amount: 'Ingrese un importe mayor o igual a cero'}
    },
    permission: {
      'service:view': 'Ver servicios', 'service:create': 'Crear servicios',
      'service:update': 'Editar servicios', 'service:delete': 'Eliminar servicios',
      'service:manage': 'Gestionar servicios'
    }
  }
}

export default messages
