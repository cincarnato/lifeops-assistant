
import SourceCrudPage from "../pages/crud/SourceCrudPage.vue";


const SourceCrudRoute = [
  {
    name: 'SourceCrudPage',
    path: '/crud/source',
    component: SourceCrudPage,
    meta: {
      auth: true,
      permission: 'source:manage',
    }
  },
]

export default SourceCrudRoute
export { SourceCrudRoute }
