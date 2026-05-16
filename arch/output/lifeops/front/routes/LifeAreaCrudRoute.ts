
import LifeAreaCrudPage from "../pages/crud/LifeAreaCrudPage.vue";


const LifeAreaCrudRoute = [
  {
    name: 'LifeAreaCrudPage',
    path: '/crud/lifearea',
    component: LifeAreaCrudPage,
    meta: {
      auth: true,
      permission: 'lifearea:manage',
    }
  },
]

export default LifeAreaCrudRoute
export { LifeAreaCrudRoute }
