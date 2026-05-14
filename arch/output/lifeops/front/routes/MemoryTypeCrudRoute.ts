
import MemoryTypeCrudPage from "../pages/crud/MemoryTypeCrudPage.vue";


const MemoryTypeCrudRoute = [
  {
    name: 'MemoryTypeCrudPage',
    path: '/crud/memorytype',
    component: MemoryTypeCrudPage,
    meta: {
      auth: true,
      permission: 'memorytype:manage',
    }
  },
]

export default MemoryTypeCrudRoute
export { MemoryTypeCrudRoute }
