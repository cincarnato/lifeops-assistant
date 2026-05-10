
import ClientTypeCrudPage from "../pages/crud/ClientTypeCrudPage.vue";


const ClientTypeCrudRoute = [
  {
    name: 'ClientTypeCrudPage',
    path: '/crud/clienttype',
    component: ClientTypeCrudPage,
    meta: {
      auth: true,
      permission: 'clienttype:manage',
    }
  },
]

export default ClientTypeCrudRoute
export { ClientTypeCrudRoute }
