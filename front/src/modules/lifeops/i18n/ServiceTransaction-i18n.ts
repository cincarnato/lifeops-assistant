const messages = {
  en: {
    servicetransaction: {
      entity: 'Service transaction',
      menu: 'Service transactions',
      crud: 'Manage service transactions',
      field: {
        service: 'Service', period: 'Period (YYYY-MM)', amount: 'Amount',
        status: 'Payment status', paidAt: 'Paid at'
      },
      status: {PENDING: 'Pending', PAID: 'Paid'},
      validation: {
        period: 'Enter a valid period in YYYY-MM format (01–12)',
        amount: 'Enter an amount greater than or equal to zero'
      }
    },
    permission: {
      'servicetransaction:view': 'View service transactions',
      'servicetransaction:create': 'Create service transactions',
      'servicetransaction:update': 'Edit service transactions',
      'servicetransaction:delete': 'Delete service transactions',
      'servicetransaction:manage': 'Manage service transactions'
    }
  },
  es: {
    servicetransaction: {
      entity: 'Transacción de servicio',
      menu: 'Transacciones de servicios',
      crud: 'Gestionar transacciones de servicios',
      field: {
        service: 'Servicio', period: 'Período (AAAA-MM)', amount: 'Importe',
        status: 'Estado del pago', paidAt: 'Fecha de pago'
      },
      status: {PENDING: 'Pendiente', PAID: 'Pagado'},
      validation: {
        period: 'Ingrese un período válido en formato AAAA-MM (01–12)',
        amount: 'Ingrese un importe mayor o igual a cero'
      }
    },
    permission: {
      'servicetransaction:view': 'Ver transacciones de servicios',
      'servicetransaction:create': 'Crear transacciones de servicios',
      'servicetransaction:update': 'Editar transacciones de servicios',
      'servicetransaction:delete': 'Eliminar transacciones de servicios',
      'servicetransaction:manage': 'Gestionar transacciones de servicios'
    }
  }
}

export default messages
