
const messages = {
  en: {
    businesspartner: {
      entity: 'Business Partner',
      menu: 'Business Partners',
      crud: 'Manage Business Partner',
      tabs: {
        BASIC: 'Basic',
        FACTURACION: 'Billing',
      },
      field: {
        name: 'Name',
        legalName: 'Legal Name',
        taxCondition: 'Tax Condition',
        taxIdType: 'Tax ID Type',
        taxIdNumber: 'Tax ID Number',
        taxAddress: 'Tax Address',
        taxEmail: 'Billing Email',
        description: 'Description',
        roles: 'Roles',
        priority: 'Priority',
        website: 'Website',
        mainContact: 'Main Contact',
        aliases: 'Aliases',
        tags: 'Tags',
        notes: 'Notes',
        user: 'User',
        archivedAt: 'Archived At',
      },
      role: {
        client: 'Client',
        provider: 'Provider',
      },
    },
    permission: {
      'businesspartner:view': 'View Business Partner',
      'businesspartner:create': 'Create Business Partner',
      'businesspartner:update': 'Edit Business Partner',
      'businesspartner:delete': 'Delete Business Partner',
      'businesspartner:manage': 'Manage Business Partner',
    },
  },
  es: {
    businesspartner: {
      entity: 'Socio comercial',
      menu: 'Socios comerciales',
      crud: 'Gestionar socio comercial',
      tabs: {
        BASIC: 'Básico',
        FACTURACION: 'Facturación',
      },
      field: {
        name: 'Nombre',
        legalName: 'Razón social',
        taxCondition: 'Condición fiscal',
        taxIdType: 'Tipo de identificación fiscal',
        taxIdNumber: 'Número de identificación fiscal',
        taxAddress: 'Domicilio fiscal',
        taxEmail: 'Email de facturación',
        description: 'Descripción',
        roles: 'Roles',
        priority: 'Prioridad',
        website: 'Sitio web',
        mainContact: 'Contacto principal',
        aliases: 'Alias',
        tags: 'Etiquetas',
        notes: 'Notas',
        user: 'Usuario',
        archivedAt: 'Archivado el',
      },
      role: {
        client: 'Cliente',
        provider: 'Proveedor',
      },
    },
    permission: {
      'businesspartner:view': 'Ver socio comercial',
      'businesspartner:create': 'Crear socio comercial',
      'businesspartner:update': 'Editar socio comercial',
      'businesspartner:delete': 'Eliminar socio comercial',
      'businesspartner:manage': 'Gestionar socio comercial',
    },
  },
};

export default messages;
