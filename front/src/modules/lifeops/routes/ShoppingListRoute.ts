import ShoppingListPage from '../pages/ShoppingListPage.vue'

const ShoppingListRoute = [{
  name: 'ShoppingListPage',
  path: '/shopping-list',
  component: ShoppingListPage,
  meta: { auth: true, permission: 'shoppingitem:view' },
}]

export default ShoppingListRoute
