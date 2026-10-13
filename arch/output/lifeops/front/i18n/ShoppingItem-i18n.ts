
const messages = {
  en: {

    shoppingitem: {
          entity: 'ShoppingItem',
          menu: 'ShoppingItem',
          crud: 'ShoppingItem',
          field:{
                       name:'name',
           quantity:'quantity',
           purchased:'purchased',
           purchasedAt:'purchasedAt',
           user:'user'
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
          entity: 'ShoppingItem',
          menu: 'ShoppingItem',
          crud: 'ShoppingItem',
          field:{
                       name:'name',
           quantity:'quantity',
           purchased:'purchased',
           purchasedAt:'purchasedAt',
           user:'user'
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
