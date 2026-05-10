
import ClientCrudPage from "../pages/crud/ClientCrudPage.vue";


const ClientCrudRoute = [
  {
    name: 'ClientCrudPage',
    path: '/crud/client',
    component: ClientCrudPage,
    meta: {
      auth: true,
      permission: 'client:manage',
    }
  },
]

export default ClientCrudRoute
export { ClientCrudRoute }
