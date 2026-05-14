
import MemoryCrudPage from "../pages/crud/MemoryCrudPage.vue";


const MemoryCrudRoute = [
  {
    name: 'MemoryCrudPage',
    path: '/crud/memory',
    component: MemoryCrudPage,
    meta: {
      auth: true,
      permission: 'memory:manage',
    }
  },
]

export default MemoryCrudRoute
export { MemoryCrudRoute }
