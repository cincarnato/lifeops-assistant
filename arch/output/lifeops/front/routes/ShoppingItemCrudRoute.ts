
import ShoppingItemCrudPage from "../pages/crud/ShoppingItemCrudPage.vue";


const ShoppingItemCrudRoute = [
  {
    name: 'ShoppingItemCrudPage',
    path: '/crud/shoppingitem',
    component: ShoppingItemCrudPage,
    meta: {
      auth: true,
      permission: 'shoppingitem:manage',
    }
  },
]

export default ShoppingItemCrudRoute
export { ShoppingItemCrudRoute }
