
import PurposeCrudPage from "../pages/crud/PurposeCrudPage.vue";


const PurposeCrudRoute = [
  {
    name: 'PurposeCrudPage',
    path: '/crud/purpose',
    component: PurposeCrudPage,
    meta: {
      auth: true,
      permission: 'purpose:manage',
    }
  },
]

export default PurposeCrudRoute
export { PurposeCrudRoute }
