
import PriorityCrudPage from "../pages/crud/PriorityCrudPage.vue";


const PriorityCrudRoute = [
  {
    name: 'PriorityCrudPage',
    path: '/crud/priority',
    component: PriorityCrudPage,
    meta: {
      auth: true,
      permission: 'priority:manage',
    }
  },
]

export default PriorityCrudRoute
export { PriorityCrudRoute }
