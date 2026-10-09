
import ServiceCrudPage from "../pages/crud/ServiceCrudPage.vue";


const ServiceCrudRoute = [
  {
    name: 'ServiceCrudPage',
    path: '/crud/service',
    component: ServiceCrudPage,
    meta: {
      auth: true,
      permission: 'service:manage',
    }
  },
]

export default ServiceCrudRoute
export { ServiceCrudRoute }
