const messages = {
  en: {
    delegate: {
      entity: 'Delegate',
      menu: 'Delegates',
      crud: 'Manage delegates',
      field: {
        contact: 'Contact',
        skills: 'Skills',
        description: 'Description',
        active: 'Active',
        user: 'User'
      },
      validation: {
        invalidContact: 'Choose one of your contacts.',
        loadFailed: 'Could not load delegates.'
      }
    },
    permission: {
      'delegate:view': 'View delegates',
      'delegate:create': 'Create delegates',
      'delegate:update': 'Edit delegates',
      'delegate:delete': 'Delete delegates',
      'delegate:manage': 'Manage delegates'
    }
  },
  es: {
    delegate: {
      entity: 'Persona para delegar',
      menu: 'Personas para delegar',
      crud: 'Gestionar personas para delegar',
      field: {
        contact: 'Contacto',
        skills: 'Habilidades',
        description: 'Descripción',
        active: 'Activo',
        user: 'Usuario'
      },
      validation: {
        invalidContact: 'Elegí uno de tus contactos.',
        loadFailed: 'No se pudieron cargar las personas para delegar.'
      }
    },
    permission: {
      'delegate:view': 'Ver personas para delegar',
      'delegate:create': 'Crear personas para delegar',
      'delegate:update': 'Editar personas para delegar',
      'delegate:delete': 'Eliminar personas para delegar',
      'delegate:manage': 'Gestionar personas para delegar'
    }
  }
};

export default messages;
