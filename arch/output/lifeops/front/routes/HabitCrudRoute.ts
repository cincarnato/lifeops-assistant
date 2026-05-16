
import HabitCrudPage from "../pages/crud/HabitCrudPage.vue";


const HabitCrudRoute = [
  {
    name: 'HabitCrudPage',
    path: '/crud/habit',
    component: HabitCrudPage,
    meta: {
      auth: true,
      permission: 'habit:manage',
    }
  },
]

export default HabitCrudRoute
export { HabitCrudRoute }
