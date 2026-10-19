
const messages = {
  en: {

    shoppingitem: {
          entity: 'Shopping item',
          menu: 'Shopping list',
          crud: 'Shopping items',
          add: 'Add', save: 'Save', edit: 'Edit item', cancel: 'Cancel', delete: 'Delete',
          pending: 'Pending', purchased: 'Purchased', refresh: 'Refresh', retry: 'Retry',
          quantityExample: 'e.g. 2 kg', count: 'No items | 1 item | {count} items', loadMore: 'Load more',
          error: 'Could not complete the operation. Please try again.',
          emptyPending: 'Your shopping list is empty. Add your first item.',
          emptyPurchased: 'No purchased items yet.',
          addedOn: 'Added {date}', boughtOn: 'Purchased {date}',
          markPurchased: 'Mark {name} as purchased', markPending: 'Mark {name} as pending',
          editItem: 'Edit {name}', deleteItem: 'Delete {name}',
          deleteConfirm: 'Delete {name} from your list?',
          purgePurchased: 'Clear purchased items',
          purgeConfirm: 'Permanently delete all your purchased items? Pending items will be kept. This cannot be undone.',
          field:{
           name:'Item',
           quantity:'Quantity',
           purchaseLocation:'Purchase location (optional)',
           purchased:'Purchased',
           purchasedAt:'Purchase date',
           createdAt:'Created on',
           user:'User'
          },
          tabs: {

          }
      },
      permission: {
              'shoppingitem:view': 'View ShoppingItem',
              'shoppingitem:create': 'Create ShoppingItem',
              'shoppingitem:update': 'Edit ShoppingItem',
              'shoppingitem:delete': 'Delete ShoppingItem',
              'shoppingitem:manage': 'Manage ShoppingItem',
      }
  },
  es: {
     shoppingitem: {
          entity: 'Artículo de compra',
          menu: 'Lista de compras',
          crud: 'Artículos de compra',
          add: 'Agregar', save: 'Guardar', edit: 'Editar artículo', cancel: 'Cancelar', delete: 'Eliminar',
          pending: 'Pendientes', purchased: 'Comprados', refresh: 'Actualizar', retry: 'Reintentar',
          quantityExample: 'Ej. 2 kg', count: 'Sin artículos | 1 artículo | {count} artículos', loadMore: 'Cargar más',
          error: 'No se pudo completar la operación. Intentá de nuevo.',
          emptyPending: 'Tu lista está vacía. Agregá el primer artículo.',
          emptyPurchased: 'Todavía no hay artículos comprados.',
          addedOn: 'Agregado el {date}', boughtOn: 'Comprado el {date}',
          markPurchased: 'Marcar {name} como comprado', markPending: 'Marcar {name} como pendiente',
          editItem: 'Editar {name}', deleteItem: 'Eliminar {name}',
          deleteConfirm: '¿Eliminar {name} de tu lista?',
          purgePurchased: 'Purgar comprados',
          purgeConfirm: '¿Eliminar definitivamente todos tus artículos comprados? Se conservarán los pendientes. Esta acción no se puede deshacer.',
          field:{
           name:'Artículo',
           quantity:'Cantidad',
           purchaseLocation:'Lugar de compra (opcional)',
           purchased:'Comprado',
           purchasedAt:'Fecha de compra',
           createdAt:'Fecha de creación',
           user:'Usuario'
          },
          tabs: {

          }
      },
     permission: {
              'shoppingitem:view': 'Ver ShoppingItem',
              'shoppingitem:create': 'Crear ShoppingItem',
              'shoppingitem:update': 'Editar ShoppingItem',
              'shoppingitem:delete': 'Eliminar ShoppingItem',
              'shoppingitem:manage': 'Gestionar ShoppingItem',
     }
  }
}

export default messages;
