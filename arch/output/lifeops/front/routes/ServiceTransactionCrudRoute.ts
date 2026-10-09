
import ServiceTransactionCrudPage from "../pages/crud/ServiceTransactionCrudPage.vue";


const ServiceTransactionCrudRoute = [
  {
    name: 'ServiceTransactionCrudPage',
    path: '/crud/servicetransaction',
    component: ServiceTransactionCrudPage,
    meta: {
      auth: true,
      permission: 'servicetransaction:manage',
    }
  },
]

export default ServiceTransactionCrudRoute
export { ServiceTransactionCrudRoute }
